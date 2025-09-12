import express from "express";
import { getAll, getGame, getRandomGames, inDevelopment, mostPlayed } from "../controllers/game.controller.js";

const route = express.Router();

route.get("/top", mostPlayed);

route.get("/get/:route", getGame);

route.get("/randomGames/:number", getRandomGames);

route.get("/all", getAll);

route.get("/inDevelopment", inDevelopment);

export default route;