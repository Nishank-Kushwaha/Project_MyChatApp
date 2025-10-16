const userActions = {
  // ✅ Conversations
  setConversations: (state, action) => {
    state.conversations = action.payload;
  },
  setActiveConversation: (state, action) => {
    state.activeConversation = action.payload;
  },
  addConversation: (state, action) => {
    state.conversations.unshift(action.payload);
  },
  updateConversation: (state, action) => {
    const { id, updates } = action.payload;
    state.conversations = state.conversations.map((c) =>
      c._id === id ? { ...c, ...updates } : c
    );
  },

  // ✅ Messages
  setMessages: (state, action) => {
    const { conversationId, messages } = action.payload;
    state.messages[conversationId] = messages;
  },
  addMessage: (state, action) => {
    const { conversationId, message } = action.payload;
    if (!state.messages[conversationId]) {
      state.messages[conversationId] = [];
    }
    state.messages[conversationId].push(message);

    // update preview in conversation list
    const convo = state.conversations.find((c) => c._id === conversationId);
    if (convo) {
      convo.lastMessage = message.content;
      convo.lastMessageAt = message.createdAt;
    }
  },
  prependMessages: (state, action) => {
    const { conversationId, messages } = action.payload;
    const existing = state.messages[conversationId] || [];
    state.messages[conversationId] = [...messages, ...existing];
  },

  // ✅ Typing indicators
  setTyping: (state, action) => {
    const { conversationId, userId, isTyping } = action.payload;
    if (!state.typingUsers[conversationId]) {
      state.typingUsers[conversationId] = [];
    }
    if (isTyping) {
      if (!state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      }
    } else {
      state.typingUsers[conversationId] = state.typingUsers[
        conversationId
      ].filter((id) => id !== userId);
    }
  },

  // ✅ Loading & reset
  setLoading: (state, action) => {
    state.loading = action.payload;
  },
  resetChat: () => initialState,
};

export default userActions;
