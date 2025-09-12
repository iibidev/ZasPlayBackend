import GameStat from "../models/GameStat.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Friend from "../models/Friend.js";
import path from "path";
import { vistaLogin } from "./view.controller.js";
import cloudinary from "./../config/cloudinary.js";

const avatars = [
    "https://res.cloudinary.com/dzwufjd9o/image/upload/v1750801760/AvatarMaker_zm7dot.webp",
    "https://res.cloudinary.com/dzwufjd9o/image/upload/v1750801760/AvatarMaker_2_qq98tm.webp",
    "https://res.cloudinary.com/dzwufjd9o/image/upload/v1750801759/AvatarMaker_3_uiaar5.webp",
    "https://res.cloudinary.com/dzwufjd9o/image/upload/v1750801759/AvatarMaker_1_pyzmwc.webp",
    "https://res.cloudinary.com/dzwufjd9o/image/upload/v1750801760/AvatarMaker_5_lv45g1.webp",
    "https://res.cloudinary.com/dzwufjd9o/image/upload/v1750801759/AvatarMaker_4_xkqpbg.webp"
];

export const login = async(req, res)=>{
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email }).select("password");
        
        if(!user || !user.comparePassword(password)){
            return res.json({ ok: false, error: "Datos incorrectos" });
        }

        const token = jwt.sign({ id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: "7d" });
        
        // Guardar el token en una cookie
        res.cookie("token", token, {
        httpOnly: true,       // evita acceso desde JS del navegador
        secure: true,        // poner en true si usas HTTPS
        sameSite: "lax",      // o "strict" para más seguridad
        maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.json({ ok: true, red: process.env.FRONTURL });
    } catch (error) {
        console.log(error);
        return res.json({ ok: false, error: "Error al iniciar sesión" })
    }
}

export const register = async(req, res)=>{
    const { email, password, username, profilePic } = req.body;

    try {
        let user = await User.findOne({ email });
        if(user) return res.json({ ok: false, error: "Ese email está en uso." });
        
        user = await User.findOne({ username });
        if(user) return res.json({ ok: false, error: "Ese usuario está en uso" });

        user = new User({ email, password, username, profilePic });
        await user.save();

        const token = jwt.sign({ id: user._id }, 
        process.env.JWT_SECRET, 
        { expiresIn: "7d" });
        
        res.cookie("token", token, {
        httpOnly: true,
        secure: true,        
        sameSite: "lax",   
        maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.json({ ok: true, red: process.env.FRONTURL });
    } catch (error) {
        console.log(error)
        return res.json({ ok: false, error: "Error en el servidor." });
    }
}

export const logout = (req, res)=>{
    res.clearCookie("token");
    return res.sendFile(path.join(process.cwd(), "src", "view", "login.html"));
}

export const viewEdit = async(req, res)=>{
    try {
        const user = await User.findById(req.user);
        if(!user) return vistaLogin(req, res);

        return res.render("edit", { user, redirect: process.env.FRONTURL });
    } catch (error) {
        console.log(error);
        return vistaLogin(req, res);
    }
}

export const updateAvatar = async(req, res) =>{
    const { avatar } = req.body;

    try {
        const user = await User.findById(req.user);

        if(user.profilePic != avatar){
            await cloudinary.uploader.destroy("fotos-perfil/" + user._id);
            user.profilePic = avatar;
            await user.save();
        }

        return res.status(200).json({ ok: true, msg: "Avatar actualizado", profilePic: user.profilePic });
    } catch (error) {
        console.log(error);
        return res.status(500).json("Error al actualizar avatar");
    }
}

export const updateProfilePic = async (req, res) => {
  try {
    const user = await User.findById(req.user);

    await cloudinary.uploader.destroy("fotos-perfil/" + user._id);

    const result = cloudinary.uploader.upload_stream(
      {
        folder: 'fotos-perfil',
        public_id: user._id,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: "auto",
        transformation: [
            { width: 300, crop: 'limit' }
        ]
      },
      async (error, result) => {
        if (error) {
          console.error('Error subiendo a Cloudinary:', error);
          return res.status(500).json({ error: 'Error al subir imagen' });
        }

        user.profilePic = result.secure_url;

        await user.save();

        return res.status(200).json({
            ok: true,
            msg: 'Foto de perfil actualizada',
            profilePic: user.profilePic
        });
      }
    );

    result.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
};

export const update = async(req, res)=>{
    try {
        const { username } = req.body;
        
        const user = await User.findById(req.user);

        if(user.username != username){
            let existingUser = await User.findOne({ username });
            if(existingUser) return res.status(400).json("Nombre de usuario en uso");
            user.username = username;
            await user.save();
        }

        return res.status(200).json({ ok: true, msg: "Perfil actualizado!", user });
    } catch (error) {
        console.log(error);        
        return res.status(500).json("Error en el servidor al actualizar");
    }
}

export const myInfo = async(req, res) =>{
    try {
        const user = await User.findById(req.user);

        return res.json({ ok: true, user });
    } catch (error) {
        console.log(error);
        return res.json({ ok: false, error: "Error en el servidor" });
    }
}

export const getProfile = async(req, res) =>{
    try {
        const idUser = req.params.id;
        const user = await User.findById(idUser);
        let me = false, friend = false;

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        if(user._id.equals(req.user)) me = true;

        const gameStatsRaw = await GameStat.find({ user: idUser }).populate('game', 'name icon');

        const gameStats = gameStatsRaw.map(stat => ({
            _id: stat._id,
            gameName: stat.game.name,
            icon: stat.game.icon,
            gamesPlayed: stat.gamesPlayed,
            gamesWon: stat.gamesWon
        }));

        friend = !!await Friend.findOne({
            $or: [
                { user1: idUser, user2: req.user },
                { user1: req.user, user2: idUser }
            ]
        });

        return res.status(200).json({
            user,
            gameStats,
            me,
            friend
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error en el servidor" });
    }
}