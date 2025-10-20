import express from "express";

import {
  getAllNotifications,
  markNotificationAsReadForConversation,
  markNotificationAsRead,
  deleteAllReadNotifications,
} from "../controllers/notification.controller.js";

const notificationRouter = express.Router();

notificationRouter.get("/user/:userId", getAllNotifications);

notificationRouter.put(
  "/user/:userId/conversation/:conversationId/read",
  markNotificationAsReadForConversation
);

notificationRouter.put(
  "/user/:userId/notification/:notificationId/read",
  markNotificationAsRead
);

notificationRouter.delete(
  "/user/:userId/delete-all-read",
  deleteAllReadNotifications
);

export default notificationRouter;
