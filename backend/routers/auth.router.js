import express from "express";

import {
  postSignUp,
  postSignIn,
  getLogout,
  getMe,
  searchUsers,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

// Email/Password auth routes
authRouter.post("/register", postSignUp);
authRouter.post("/login", postSignIn);
authRouter.get("/logout", getLogout);
authRouter.get("/me", getMe);
authRouter.get("/search", searchUsers);

export default authRouter;
