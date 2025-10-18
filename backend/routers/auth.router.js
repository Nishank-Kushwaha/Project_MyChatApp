import express from "express";

import {
  postSignUp,
  postSignIn,
  getLogout,
  getMe,
  getUsers,
  searchUsers,
  resetPasswordWithOldPassword,
  resetPasswordWithOTP,
  verifyOTP,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

// Public routes (no auth required)
authRouter.post("/register", postSignUp);
authRouter.post("/login", postSignIn);
authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/reset-password-otp", resetPasswordWithOTP);

// Protected routes (auth required)
authRouter.get("/logout", authMiddleware, getLogout);
authRouter.post("/users", authMiddleware, getUsers);
authRouter.get("/me", authMiddleware, getMe);
authRouter.get("/search", authMiddleware, searchUsers);
authRouter.post("/reset-password", authMiddleware, resetPasswordWithOldPassword);

export default authRouter;
