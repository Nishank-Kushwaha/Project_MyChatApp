// src/lib/socket.js
import { io } from "socket.io-client";

let socket;

// ✅ Get auth token from cookies
const getAuthToken = () => {
  // Try to find 'authorization' cookie first
  const authCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("authorization="));

  if (authCookie) {
    const encodedToken = authCookie.split("=")[1];
    // Decode the URL-encoded token and remove 'Bearer ' prefix
    const decodedToken = decodeURIComponent(encodedToken);
    const finalToken = decodedToken.replace("Bearer ", "").trim();

    return finalToken;
  }

  return null;
};

export const initSocket = () => {
  if (socket?.connected) return socket;

  const socketUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const token = getAuthToken();

  if (!token) {
    console.error("❌ No auth token found. Cannot connect to socket.");
    return null;
  }

  socket = io(socketUrl, {
    path: "/socket.io/",
    withCredentials: true,
    auth: {
      token: token, // ✅ Pass token for authentication
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("✅ Connected to socket:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from socket");
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Socket connection error:", err.message);
  });

  socket.on("error", (error) => {
    console.error("⚠️ Socket error:", error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// --- Event helpers ---
export const joinConversation = (conversationId) => {
  if (!socket || !conversationId) return;
  socket.emit("join_conversation", conversationId);
  console.log(`🔥 Joining conversation: ${conversationId}`);
};

export const leaveConversation = (conversationId) => {
  if (!socket || !conversationId) return;
  socket.emit("leave_conversation", conversationId);
  console.log(`🔙 Leaving conversation: ${conversationId}`);
};

// ✅ Send message via socket only
export const sendMessage = (data) => {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }
  socket.emit("send_message", data);
  console.log("📤 Sending message via socket:", data);
};

export const onNewMessage = (callback) => {
  if (!socket) return;
  socket.on("new_message", callback);
};

export const offNewMessage = () => {
  if (!socket) return;
  socket.off("new_message");
};

export const emitTyping = (conversationId, isTyping) => {
  if (!socket || !conversationId) return;
  socket.emit("typing", { conversationId, isTyping });
};

export const onTyping = (callback) => {
  if (!socket) return;
  socket.on("user_typing", callback);
};

export const offTyping = () => {
  if (!socket) return;
  socket.off("user_typing");
};
