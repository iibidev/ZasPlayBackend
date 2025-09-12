import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    select: false
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  profilePic: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    required: true,
    default: false
  },
  dev: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Middleware para hashear la contraseña antes de guardar
userSchema.pre("save", async function (next) {
  // Solo si la contraseña fue modificada o es nueva
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10); // puedes ajustar el número de rondas
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Método opcional para comparar contraseñas luego
userSchema.methods.comparePassword = function (candidatePassword) {  
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
