import express from "express";
import { viewEdit, getProfile, login, myInfo, register, update, updateProfilePic, updateAvatar } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });



const route = express.Router();


route.post("/edit", verifyToken, viewEdit);

route.get("/myInfo", verifyToken, myInfo);

route.get("/profile/:id", verifyToken, getProfile);

route.post("/login", login);

route.post("/register", register);

route.put("/update", verifyToken, update);

route.put("/updateAvatar", verifyToken, updateAvatar);

route.put("/updatePic", verifyToken, upload.single("profilePic"), updateProfilePic);

export default route;