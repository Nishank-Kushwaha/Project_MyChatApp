// src/redux/slices/notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";
import notificationActions from "../actions/notificationActions.js";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: notificationActions,
});

export const {
  setNotifications,
  markAsReadForConversation,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
