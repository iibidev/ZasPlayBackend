import GameStat from "./../models/GameStat.js";
import Game from "./../models/Game.js";

export const mostPlayed = async(req, res) =>{

    try {
        const topGames = await GameStat.aggregate([
        {
            $group: {
            _id: "$game",
            totalPlayed: { $sum: "$gamesPlayed" }
            }
        },
        { $sort: { totalPlayed: -1 } },
        { $limit: 5 },
        {
            $lookup: {
            from: "games",
            localField: "_id",
            foreignField: "_id",
            as: "gameDetails"
            }
        },
        { $unwind: "$gameDetails" },
        {
            $project: {
                _id: 1,
                totalPlayed: 1,
                name: "$gameDetails.name",
                description: "$gameDetails.description",
                thumbnail: "$gameDetails.thumbnail",
                icon: "$gameDetails.icon",
                route: "$gameDetails.route"
            }
        }
        ]);

        return res.json(topGames);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, error: "Error en el servidor" });
    }

}

export const getGame = async(req, res) =>{
    const gameRoute = req.params.route;
    try {
        const game = await Game.findOne({ route: gameRoute });

        if(!game) return res.status(404).json("Ese juego no existe");

        return res.status(200).json(game);
    } catch (error) {
        console.log(error);
        return res.status(500).json("Error en el servidor");
    }
}

export const getRandomGames = async(req, res) =>{
    const number = req.params.number;
    try {
        const total = await Game.countDocuments();
        if(number > total) return res.status(404).json("No se puede recoger más del total de juegos existentes");

        const resultados = await Game.aggregate([
            { $sample: { size: Number(number) } }
        ]);

        return res.status(200).json(resultados);
    } catch (error) {
        console.log(error);
        return res.status(500).json("Error en el servidor");
    }
}

export const getAll = async(req, res) =>{
    try {
        const games = await Game.find();
        return res.status(200).json(games);
    } catch (error) {
        console.log(error);        
        return res.status(500).json("Error en el servidor");
    }
}

export const inDevelopment = async(req, res) =>{
    try {
        const games = await Game.find({isInDevelopment: true});
        return res.status(200).json(games);
    } catch (error) {
        console.log(error);        
        return res.status(500).json("Error en el servidor");
    }
}