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

const api = axios.create({
  baseURL: `${API_BASE}/api/notifications`,
  withCredentials: true,
});

// ============================================================
// 1️⃣ GET ALL NOTIFICATIONS
// ============================================================
export const getAllNotifications = async (
  userId,
  { limit = 20, skip = 0, unreadOnly = false, type } = {}
) => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit);
    params.append("skip", skip);
    params.append("unreadOnly", unreadOnly);
    if (type) params.append("type", type);

    const res = await api.get(`/user/${userId}?${params.toString()}`);
    if (!res.data.success) {
      console.error("Failed to get all notifications", res);
      throw new Error(res || "Failed to get all notifications");
    }
    return res;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error.response?.data || error.message;
  }
};

// ============================================================
// 2️⃣ MARK AS READ FOR CONVERSATION
// ============================================================
export const markAsReadForConversation_api = async (userId, conversationId) => {
  try {
    const res = await api.put(
      `/user/${userId}/conversation/${conversationId}/read`
    );
    if (!res.data.success) {
      console.error("Failed to mark as read for conversation", res);
      throw new Error(res || "Failed to mark as read for conversation");
    }
    return res;
  } catch (error) {
    console.error("Error marking as read for conversation:", error);
    throw error.response?.data || error.message;
  }
};

// ============================================================
// 5️⃣ MARK AS READ
// ============================================================
export const markAsRead_api = async (userId, notificationId) => {
  try {
    const res = await api.put(
      `/user/${userId}/notification/${notificationId}/read`
    );
    if (!res.data.success) {
      console.error("Failed to mark as read", res);
      throw new Error(res || "Failed to mark as read");
    }
    return res;
  } catch (error) {
    console.error("Error marking as read:", error);
    throw error.response?.data || error.message;
  }
};

// ============================================================
// 8️⃣ DELETE ALL READ
// ============================================================
export const deleteAllRead = async (userId) => {
  try {
    const res = await api.delete(`/user/${userId}/delete-all-read`);
    if (!res.data.success) {
      console.error("Failed to delete all read", res);
      throw new Error(res || "Failed to delete all read");
    }
    return res;
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    throw error.response?.data || error.message;
  }
};
