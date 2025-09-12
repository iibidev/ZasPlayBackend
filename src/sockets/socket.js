import GameRoom from "../models/GameRoom.js";
import User from "../models/User.js";
import { candyTrap } from "./candytrap.js";
import { rpsSocket } from "./rock-paper-scissors.js";
import { tictactoe } from "./tictactoe.js";

export const sockets = (io) =>{
    io.on("connection", (socket) =>{

        socket.on("joinChannel", async(userId) =>{
            socket.user = userId;
            socket.join(socket.user);
            const user = await User.findById(socket.user);            
            if(user){
                user.active = true;
                await user.save();
            }
            console.log("Se ha conectado el usuario: " + socket.user);                        
        });

        socket.on("createRoom", async({ game, user })=>{
            try {
                const newRoom = new GameRoom({
                    game: game._id,
                    players: [{ 
                        user: user._id,
                        host: true
                     }] 
                });
                await newRoom.save();
                const room = await GameRoom.findById(newRoom._id).populate("players.user").populate("game");
                socket.join(room.code);
                socket.emit("roomCreated", room.code);
                io.emit("someoneRoomCreated", room);
                console.log("El jugador: " + socket.user + " ha creado una sala");
                
            } catch (error) {
                console.log(error);
                return socket.emit("failedJoinToRoom", "Error al crear una sala");
            }
        });

        socket.on("joinRoom", async({ roomCode, user }) =>{
            try {
                const room = await GameRoom.findOne({ code: roomCode }).populate("game").populate("players.user");
                //Check that the room exists and it's not full.

                if(!room){
                    return socket.emit("failedJoinToRoom", "Esa sala no existe");
                }

                //See if the user who is trying to join the room is already in the room (for when you create the room).
                if(!room.players.find(p => p.user._id.equals(user._id))){
                    if(room.players.length >= room.game.max){
                        socket.emit("failedJoinToRoom", "Sala llena");
                    }else if(room.status === "playing"){
                        socket.emit("failedJoinToRoom", "Imposible unirse a la sala mientras se está jugando.");
                    }else{
                        room.players.push({
                            user: user._id,
                            host: false
                        });
                        await room.save();
                        const updatedRoom = await GameRoom.findById(room._id).populate("players.user").populate("game");
                        socket.join(updatedRoom.code);
                        //Send to other players that someone joined
                        socket.to(updatedRoom.code).emit("userJoined", user);
                        //Send message to the socket
                        socket.emit("joinedToRoom", updatedRoom); 
                        io.emit("userJoinedToRoom", updatedRoom);                     
                        console.log("El jugador:" + socket.user +  "se ha unido a la sala y se ha notificado a los demas");
                    }
                }else{
                    socket.emit("joinedToRoom", room);
                }
            } catch (error) {
                console.log(error);
                return socket.emit("failedJoinToRoom", "Error al unirse a la sala");
            }
        });

        socket.on("leaveRoom", ({ roomCode }) =>{
            leave(io, socket, roomCode);
        });

        socket.on("sendInvite", ({ sender, room, receiver }) =>{
            console.log(`El usuario ${ sender.username } ha enviado una invitación a ${ receiver } para que se una a su sala del juego ${ room.game.name }`);
            io.to(receiver).emit("receiveInvitation", { sender, room });
        });

        socket.on("kickOut", async({ code, userId }) =>{            
            const currentRoom = await GameRoom.findOne({ code });
            const kickedUser = currentRoom.players.find(p => p.user == userId);            
            const sockets = await io.in(currentRoom.code).fetchSockets();
            
            sockets.forEach(async(s) => {
                if(s.user == kickedUser.user){                    
                    s.leave(currentRoom.code);
                    currentRoom.players = currentRoom.players.filter(p => p.user._id != kickedUser.user.toString());
                    await currentRoom.save();
                    const roomUpdated = await GameRoom.findById(currentRoom._id).populate("players.user");
                    io.to(roomUpdated.code).emit("userLeft", kickedUser.user.toString());
                    s.emit("kicked", "El host te ha expulsado");
                    io.emit("userLeftRoom", roomUpdated);
                }
            });
        });

        socket.on("startGame", async(code)=>{
            try {
                const room = await GameRoom.findOne({ code });
                room.status = "playing";
                await room.save();
                
                io.to(room.code).emit("gameStarted", "El juego ha comenzado");
            } catch (error) {
                console.log(error);
                return socket.emit("failedStartGame", "Error al empezar el juego");
            }
        });

        socket.on("disconnect", async() =>{
            console.log("Se ha desconectado: " + socket.user);

            const user = await User.findById(socket.user);
            if(user){
                user.active = false;
                await user.save();
            }

            //Check if the user is in a room
            const room = await GameRoom.findOne({
                "players.user": socket.user
            });
            if(room){
                leave(io, socket, room.code);
            }
        });

        socket.on("firstTurn", ({ room }) =>{
            const turn = Math.floor(Math.random() * 100) % 2;
            
            io.to(room.code).emit("whoStarts", room.players[turn].user);
        });

        rpsSocket(io, socket);
        tictactoe(io, socket);
        candyTrap(io, socket);
    });
}

async function leave(io, socket, roomCode){
    try {
        const currentRoom = await GameRoom.findOne({ code: roomCode });
        const leavingUser = currentRoom.players.find(p => p.user == socket.user);
        const is_host = leavingUser.host;
        socket.leave(currentRoom.code);
        if(is_host){
            await currentRoom.deleteOne();
            //Get sockets from a room
            const socketsInRoom = await io.in(currentRoom.code).fetchSockets();
            for (const s of socketsInRoom) {
                s.leave(currentRoom.code);
                s.emit("hostLeft", "El host ha salido de la sala");
            }
            io.emit("removeRoom", roomCode);
        }else{
            currentRoom.players = currentRoom.players.filter(p => p.user._id != socket.user);
            await currentRoom.save();
            const roomUpdated = await GameRoom.findById(currentRoom._id).populate("players.user");
            io.to(roomCode).emit("userLeft", socket.user);
            io.emit("userLeftRoom", roomUpdated);
        }

        socket.emit("roomLeft");
    } catch (error) {
        console.log(error);
        return socket.emit("failedLeaveRoom", "Error al salir de la sala");
    }
}