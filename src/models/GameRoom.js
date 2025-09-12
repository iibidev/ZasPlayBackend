import mongoose from "mongoose";
import { generateRoomCode } from "./../utils/generateRoomCode.js";

const gameRoomSchema = new mongoose.Schema({
  game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  players: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      host: {
        type: Boolean,
        default: false
      }
    }
  ],
  code: {
    type: String,
    unique: true
  },
  status: { type: String, enum: ["waiting", "playing"], default: "waiting" }
}, { timestamps: true });

gameRoomSchema.pre('validate', async function (next) {
  if (!this.code) {
    let unique = false;
    while (!unique) {
      const newCode = generateRoomCode();
      const existing = await mongoose.models.GameRoom.findOne({ code: newCode });
      if (!existing) {
        this.code = newCode;
        unique = true;
      }
    }
  }
  next();
});

export default mongoose.model("GameRoom", gameRoomSchema);