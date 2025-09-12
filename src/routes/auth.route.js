import express from "express";
import { vistaLogin, vistaRegister } from "./../controllers/view.controller.js";
import { viewEdit, getProfile, login, logout, myInfo, register, update, updateProfilePic, updateAvatar } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });



const route = express.Router();


// Ruta de login
route.get("/login", vistaLogin);

// Ruta de register
route.get("/register", vistaRegister);

route.get("/logout", logout);

route.get("/edit", verifyToken, viewEdit);

route.get("/myInfo", verifyToken, myInfo);

route.get("/profile/:id", verifyToken, getProfile);

route.post("/login", login);

route.post("/register", register);

route.put("/update", verifyToken, update);

route.put("/updateAvatar", verifyToken, updateAvatar);

route.put("/updatePic", verifyToken, upload.single("profilePic"), updateProfilePic);

export default route;