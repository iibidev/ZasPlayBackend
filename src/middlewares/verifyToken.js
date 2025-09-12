import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    // Leer header Authorization: Bearer <token>
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardar info del usuario en req.user
    req.user = decoded.id;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
