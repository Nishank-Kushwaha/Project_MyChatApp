// routes/messageRoutes.js
import express from "express";
import { getMessages } from "../controllers/message.controller.js";

const messageRouter = express.Router();

// ✅ Fetch messages
messageRouter.get("/:conversationId", getMessages);

export default messageRouter;
