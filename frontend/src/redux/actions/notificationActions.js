const notificationActions = {
  setNotifications: (state, action) => {
    state.notifications = action.payload;
    state.unreadCount = action.payload.filter((n) => !n.isRead).length;
  },
  markAsReadForConversation: (state, action) => {
    const conversationId = action.payload;

    state.notifications.forEach((notif) => {
      if (notif.conversationId._id === conversationId && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount--;
      }
    });
  },
  clearNotifications: (state) => {
    state.notifications = [];
    state.unreadCount = 0;
  },
};

export default notificationActions;
