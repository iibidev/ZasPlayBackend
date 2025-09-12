import mongoose from "mongoose";

export const connection = async() =>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Conectado a MongoDB Atlas");
    } catch (error) {
        console.error("❌ Error de conexión a MongoDB:", error);
    }
}