import express from "express";
import { getRooms } from "../controllers/room.controller.js";

const route = express.Router();

route.get("/:game", getRooms);

export default route;