import Friend from "../models/Friend.js"
import User from "../models/User.js";

export const getFriends = async(req, res) =>{
    const myId = req.user;
    try {
        const friendList = await Friend.find({
            $or: [ //Para buscar haciendo un OR
                { user1: myId },
                { user2: myId }
            ],
        }).sort({ createdAt: -1 }).populate("user1 user2");

        const friends = friendList.map(f =>{
            const friend = f.user1._id.equals(myId) ? f.user2 : f.user1;
            return {
                ...friend.toObject(),
                is_friend: true
            };
        });


        return res.status(200).json( friends );
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error en el servidor" });
    }
}

export const toggleFriend = async(req, res) =>{
    const user2Id = req.params.userId;
    let is_friend = null;
    try {
        let friend = await Friend.findOne({
            $or: [
                { user1: req.user, user2: user2Id },
                { user1: user2Id, user2: req.user }
            ]
        });

        if(friend){
            await friend.deleteOne();
            is_friend = false;
        }else{
            friend = new Friend({ user1: req.user, user2: user2Id });
            await friend.save();
            is_friend = true;
        }

        res.status(200).json({ is_friend });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
}

export const findUsers = async(req, res) =>{
    const query = req.query.q || "";

    try {
        const usersDoc = await User.find({
            username: {
                $regex: query,
                $options: "i"   //Ignorar mayus y minus
            },
            _id: {
                $ne: req.user //not equal
            }
        }).limit(7);

        const users = await Promise.all(usersDoc.map(async (u) => {
            const is_friend = !!await Friend.findOne({
                $or: [
                    { user1: req.user, user2: u._id },
                    { user1: u._id, user2: req.user }
                ]
            });

            const user = u.toObject();
            user.is_friend = is_friend;

            return user;
        }));


        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
}