import express from "express";

import { sendMail } from "../controllers/email.controller.js";

const emailRouter = express.Router();

emailRouter.post("/send-mail", sendMail);

export default emailRouter;
