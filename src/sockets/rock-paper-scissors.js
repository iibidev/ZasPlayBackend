import GameRoom from "../models/GameRoom.js";
import GameStat from "../models/GameStat.js";

export const rpsSocket = (io, socket) =>{
    socket.on("play", ({ room, player, play }) =>{
        socket.to(room).emit("otherPlayerPlayed", { player, play });
    });

    socket.on("checkWinner", async({ gameId, room, play1, play2 }) =>{
        try {
            const gameRoom = await GameRoom.findOne({ code: room });
            gameRoom.status = "waiting";
            await gameRoom.save();
            const players = [ play1.player, play2.player ];
            const gameStatsArray = [];

            for(const p of players){
                let gameStat = await GameStat.findOne({
                    game: gameId,
                    user: p
                });

                if(gameStat){
                    gameStat.gamesPlayed += 1;
                    await gameStat.save();
                }else{
                    gameStat = new GameStat({ game: gameId, user: p, gamesPlayed: 1 });
                    await gameStat.save();
                }
                gameStatsArray.push(gameStat);
            }

            //0 ->rock, 1-> paper, 2-> scissors
            if(play1.play == play2.play) return io.to(room).emit("draw");

            // Posibles combinaciones ganadoras para play1
            const wins = {
                0: 2, // rock vence a scissors
                1: 0, // paper vence a rock
                2: 1  // scissors vence a paper
            };

            if(wins[play1.play] === play2.play){
                gameStatsArray[0].gamesWon += 1;
                await gameStatsArray[0].save();

                io.to(gameStatsArray[0].user.toString()).emit("winner", play2.play);
                io.to(gameStatsArray[1].user.toString()).emit("looser", play1.play);
            }else{
                gameStatsArray[1].gamesWon += 1;
                await gameStatsArray[1].save();

                io.to(gameStatsArray[1].user.toString()).emit("winner", play1.play);
                io.to(gameStatsArray[0].user.toString()).emit("looser", play2.play);
            }
        } catch (error) {
            console.log(error);
            return io.to("winnerError", "Error al comprobar el ganador");
        }
    });
}