import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function authMiddleware(req, res, next) {
  // Get token from cookies
  let cookieAuth = req.cookies?.authorization;

  if (cookieAuth) {
    cookieAuth = decodeURIComponent(cookieAuth);
  }

  console.log("🔑 Auth token:", cookieAuth ? "Present" : "Missing");

  if (!cookieAuth || !cookieAuth.startsWith("Bearer ")) {
    console.log("🚫 No valid auth token");
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = cookieAuth.split(" ")[1];

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
