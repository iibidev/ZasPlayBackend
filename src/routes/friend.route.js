import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { findUsers, getFriends, toggleFriend } from "../controllers/friend.controller.js";

const route = express.Router();

route.get("/myFriends", verifyToken, getFriends);

route.get("/toggle/:userId", verifyToken, toggleFriend);

route.get("/find", verifyToken, findUsers);

export default route;