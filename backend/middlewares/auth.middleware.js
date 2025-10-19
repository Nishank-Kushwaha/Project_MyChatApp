import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function authMiddleware(req, res, next) {
  // Get token from cookies
  let token = req.cookies?.authorization;

  if (token) {
    token = decodeURIComponent(token);
  }

  console.log("🔑 Auth token:", token ? "Present" : "Missing");

  if (!token) {
    console.log("🚫 No valid auth token");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    console.log("auth middleware : JWT_SECRET : ", JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token verified for:", decoded.email);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    };

    next();
  } catch (err) {
    console.log("🚫 Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}
