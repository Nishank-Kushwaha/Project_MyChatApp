import express from "express";

import { getGroupDetails } from "../controllers/group.controller.js";

const groupRouter = express.Router();

groupRouter.post("/details", getGroupDetails);

export default groupRouter;
