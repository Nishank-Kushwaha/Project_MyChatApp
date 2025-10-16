import { createSlice } from "@reduxjs/toolkit";
import chatActions from "../actions/chatActions";

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  loading: false,
  typingUsers: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: chatActions,
});

export const {
  setConversations,
  setActiveConversation,
  addConversation,
  updateConversation,
  setMessages,
  addMessage,
  prependMessages,
  setTyping,
  setLoading,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;
