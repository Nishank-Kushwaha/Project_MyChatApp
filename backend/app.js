// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import { connect } from "../backend/dbConnect.js";
import { rootDir } from "./utils/pathUtil.js";

import authRouter from "./routers/auth.router.js";
import conversationRouter from "./routers/conversation.router.js";
import messageRouter from "./routers/message.router.js";
import groupRouter from "./routers/group.router.js";
import emailRouter from "./routers/email.router.js";

import { authMiddleware } from "./middlewares/auth.middleware.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Import your Message model
import Message from "./models/Message.js"; // Adjust path as needed
import Conversation from "./models/Conversation.js";

dotenv.config();
connect();

const app = express();

// CORS setup for both HTTP & Socket.IO
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, "public")));

// Create single HTTP server for both Express + Socket.IO
const httpServer = createServer(app);

// Setup Socket.IO server with matching path and CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  path: "/socket.io/",
});

// ✅ Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.cookie?.split("token=")[1]?.split(";")[0];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    console.log("decoded", decoded);

    socket.userId = decoded.id || decoded.userId;
    socket.username = decoded.username;

    console.log(`✅ Authenticated socket: ${socket.userId}`);
    next();
  } catch (error) {
    console.error("Socket auth error:", error.message);
    next(new Error("Authentication error"));
  }
});

// ✅ Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log(`👨 New user connected: ${socket.username} (${socket.id})`);

  // Join conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`🔥 ${socket.username} joined conversation: ${conversationId}`);
  });

  // Leave conversation room
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(conversationId);
    console.log(`🔙 ${socket.username} left conversation: ${conversationId}`);
  });

  // ✅ Handle sending messages (save to DB + broadcast)
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, content } = data;

      if (!content || !conversationId) {
        socket.emit("error", { message: "Missing content or conversationId" });
        return;
      }

      // Get all connected sockets in the room
      const clients = await io.in(conversationId).fetchSockets();

      // Get userIds of all connected users (except sender)
      const readBy = clients
        .map((s) => s.userId)
        .filter((id) => id !== socket.userId);

      // Save message to database
      const newMessage = await Message.create({
        conversationId,
        senderId: socket.userId,
        content,
        readBy, // ✅ all connected users except sender
      });

      // Update last message info in conversation
      const updatedConversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          lastMessage: content,
          lastMessageAt: Date.now(),
        },
        { new: true } // returns updated doc
      );

      // Populate sender info if needed
      await newMessage.populate("senderId", "username email");

      // Broadcast to all users in the conversation (including sender)
      io.to(conversationId).emit("new_message", {
        _id: newMessage._id,
        conversationId: newMessage.conversationId,
        sender: {
          _id: newMessage.senderId._id,
          username: newMessage.senderId.username,
        },
        content: newMessage.content,
        createdAt: newMessage.createdAt,
      });

      console.log(`📨 Message sent in ${conversationId} by ${socket.username}`);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit("user_typing", {
      conversationId,
      isTyping,
      username: socket.username,
      userId: socket.userId,
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.username} (${socket.id})`);
  });
});

// Routes (public routes first, then apply auth middleware to protected routes)
app.use("/api/users", authRouter);
app.use("/api", emailRouter);

// Apply auth middleware to protected routes only
app.use("/conversations", authMiddleware, conversationRouter);
app.use("/groups", authMiddleware, groupRouter);
app.use("/api/messages", authMiddleware, messageRouter);

// Health route
app.get("/health", (req, res) => {
  res.json({ status: "OK", database: "Connected" });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
