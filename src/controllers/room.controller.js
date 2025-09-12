import Game from "../models/Game.js";
import GameRoom from "../models/GameRoom.js";

export const getRooms = async(req, res) =>{
    const gameRoute = req.params.game;

    try {
        const game = await Game.findOne({ route: gameRoute });
        if(!game) return res.status(400).json("Ese juego no existe");

        const rooms = await GameRoom.find({ game: game._id }).populate("players.user").populate("game");

        return res.status(200).json({ game, rooms });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
}