import GameRoom from "../models/GameRoom.js";
import GameStat from "../models/GameStat.js";

export async function createStats(room){
    const gameRoom = await GameRoom.findById(room._id);
    gameRoom.status = "waiting";
    await gameRoom.save();
    const stats = [];
    for(const player of room.players){
        let gameStat = await GameStat.findOne({
            game: room.game._id,
            user: player.user._id
        });

        if(gameStat){
            gameStat.gamesPlayed += 1;
            await gameStat.save();
        }else{
            gameStat = new GameStat({ game: room.game._id, user: player.user._id, gamesPlayed: 1 });
            await gameStat.save();
        }
        stats.push(gameStat);
    }
    return stats;
}