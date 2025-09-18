import { createStats } from "../utils/createStats.js";

export const tictactoe = (io, socket) =>{
    const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
    ];

    function checkWinner(board) {
        for (const combo of WINNING_COMBINATIONS) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }

        if (board.every(cell => cell !== "")) {
            return "draw";
        }

        return null;
    }

    socket.on("tic-makePlay", async({ room, board, play })=>{
        board[play.position] = play.icon;
        const result = checkWinner(board);
        io.to(room.code).emit("tic-boardUpdate", board);
        console.log(room);
        

        if(result){            
            const stats = await createStats(room);
            console.log(stats);
            

            if(result === "draw"){
                io.to(room.players[0].user._id).emit("tic-draw", stats[0]);
                io.to(room.players[1].user._id).emit("tic-draw", stats[1]);
            }else if(result === "x"){
                stats[0].gamesWon += 1;
                await stats[0].save();
                io.to(room.players[0].user._id).emit("tic-win", stats[0]);
                io.to(room.players[1].user._id).emit("tic-lost", stats[1]);
            }else if(result === "o"){
                stats[1].gamesWon += 1;
                await stats[1].save();
                io.to(room.players[1].user._id).emit("tic-win", stats[1]);
                io.to(room.players[0].user._id).emit("tic-lost", stats[0]);
            }
        }

    });

}