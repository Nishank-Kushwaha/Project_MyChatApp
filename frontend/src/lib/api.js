// lib/api.js
const API_BASE = `${import.meta.env.VITE_BACKEND_URL}`;
import axios from "axios";

const headers = () => ({
  "Content-Type": "application/json",
});

// Conversations
export const fetchConversations = async () => {
  const res = await fetch(`${API_BASE}/conversations`, {
    headers: headers(),
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Failed to fetch conversations", data);
    throw new Error(data.message || "Failed to fetch conversations");
  }
  return data;
};

export const createPrivateChat = async (userB) => {
  const response = await axios.get(
    `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
    { withCredentials: true }
  );
  const res = await fetch(`${API_BASE}/conversations/private`, {
    method: "POST",
    headers: headers(),
    credentials: "include",
    body: JSON.stringify({ userB, userA: response.data.user.id }), // userA comes from auth
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("Create private chat error:", data);
    throw new Error(data.message || "Failed to private chat");
  }
  return data;
};

export const createGroupChat = async (name, members) => {
  const response = await axios.get(
    `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
    { withCredentials: true }
  );
  const res = await fetch(`${API_BASE}/conversations/group`, {
    method: "POST",
    headers: headers(),
    credentials: "include",
    body: JSON.stringify({ name, members, createdBy: response.data.user.id }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("Create group chat error:", data);
    throw new Error(data.message || "Failed to create group chat");
  }
  return data;
};

export const addGroupMember = async (conversationId, userId) => {
  const res = await fetch(
    `${API_BASE}/conversations/members/add/${conversationId}`,
    {
      method: "POST",
      headers: headers(),
      credentials: "include",
      body: JSON.stringify({ userId }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    console.error("Failed to add member", data);
    throw new Error(data.message || "Failed to add member");
  }
  return data;
};

export const removeGroupMember = async (conversationId, userId) => {
  const res = await fetch(
    `${API_BASE}/conversations/members/delete/${conversationId}`,
    {
      method: "POST",
      headers: headers(),
      credentials: "include",
      body: JSON.stringify({ userId }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    console.error("Failed to remove member", data);
    throw new Error(data.message || "Failed to remove member");
  }
  return data;
};

// Messages (these will use Socket.IO for real-time, but keep REST as fallback)
export const fetchMessages = async (conversationId, page = 1, limit = 50) => {
  const res = await fetch(
    `${API_BASE}/api/messages/${conversationId}?page=${page}&limit=${limit}`,
    { headers: headers(), credentials: "include" }
  );

  const data = await res.json();
  if (!res.ok) {
    console.error("Failed to fetch messages", data);
    throw new Error(data.message || "Failed to fetch messages");
  }
  return data;
};

// Users (for search)
export const searchUsers = async (query) => {
  const res = await fetch(
    `${API_BASE}/api/users/search?q=${encodeURIComponent(query)}`,
    {
      headers: headers(),
      credentials: "include",
    }
  );

  const data = await res.json();
  if (!res.ok) {
    console.error("Failed to search users", data);
    throw new Error(data.message || "Failed to search users");
  }
  return data;
};
