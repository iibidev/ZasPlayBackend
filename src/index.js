// src/index.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { sockets } from './sockets/socket.js';
import authRoute from './routes/auth.route.js';
import { connection } from './database/db.js';
import cookieParser from "cookie-parser";
import gameRoute from "./routes/game.route.js";
import friendRoute from "./routes/friend.route.js";
import roomRoute from "./routes/room.route.js";
import path from 'path';

// Cargar variables de entorno
dotenv.config();
connection();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTURL
  },
  transports: ["websocket"]
});

// Middlewares
app.use(cors({
    origin: process.env.FRONTURL,
    credentials: true
}));

app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
app.set("view engine", 'ejs');
app.set("views", path.join(process.cwd(), "src", "view"));

app.use("/auth", authRoute);
app.use("/game", gameRoute);
app.use("/friend", friendRoute);
app.use("/room", roomRoute);

sockets(io);

// === INICIAR SERVIDOR ===
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor listo en el puerto ${PORT}`);
});
