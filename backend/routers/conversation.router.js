import express from "express";

import {
  postPrivate,
  postGroup,
  postAddMember,
  postDeleteMember,
  getAllConversation,
} from "../controllers/conversation.controller.js";

const conversationRouter = express.Router();

// Email/Password auth routes
conversationRouter.post("/private", postPrivate);
conversationRouter.post("/group", postGroup);
conversationRouter.post("/members/add/:id", postAddMember);
conversationRouter.post("/members/delete/:id", postDeleteMember);
conversationRouter.get("/", getAllConversation);

export default conversationRouter;
