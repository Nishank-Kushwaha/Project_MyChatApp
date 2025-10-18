import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(payload) {
  console.log("auth.js : JWT_SECRET : ", JWT_SECRET);
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
