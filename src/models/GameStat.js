// models/GameStats.js
import mongoose from "mongoose";

const gameStatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  gamesPlayed: { type: Number, default: 0 },
  gamesWon: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("GameStat", gameStatsSchema);
