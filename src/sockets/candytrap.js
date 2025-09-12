import { createStats } from "../utils/createStats.js";

export const candyTrap = (io, socket) =>{
    socket.on("ct-poison-a-candy", ({ room, candies, position, userId }) =>{
        candies[position].poison = true;
        candies[position].who = userId;
        io.to(room.code).emit("ct-update-candies", {updatedCandies: candies, poisonedCandyEaten: false, userId: null, position});

        const poisonedCandies = candies.filter(c => c.poison === true);
        if(poisonedCandies.length == 2) io.to(room.code).emit("ct-start");
    });

    socket.on("ct-eat-candy", async({ room, candies, position, userId })=>{
        candies[position].eaten = true;
        if(candies[position].poison){
            io.to(room.code).emit("ct-update-candies", {updatedCandies: candies, poisonedCandyEaten: true, userId: userId, position});
            const stats = await createStats(room);
            const winner = stats.find(s => s.user != userId);
            winner.gamesWon += 1;
            await winner.save();
        }else{
            io.to(room.code).emit("ct-update-candies", {updatedCandies: candies, poisonedCandyEaten: false, userId: userId, position});
        }
    });
}