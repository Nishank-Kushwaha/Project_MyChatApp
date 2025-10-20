import Notification from "../models/Notification.js";
import ConversationMember from "../models/ConversationMember.js";
import mongoose from "mongoose";

// ============================================================
//  GET ALL NOTIFICATIONS FOR A USER
// ============================================================
export const getAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0, unreadOnly = false, type } = req.query;

    // ✅ Verify user can only access their own notifications
    if (req.user.id !== userId) {
      return res.status(403).json({
        message: "Unauthorized: Cannot access other user's notifications",
      });
    }

    // Build filter
    const filter = {
      recipient: userId,
    };
    if (unreadOnly === "true") filter.isRead = false;
    if (type) filter.type = type;

    // Fetch notifications
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate("sender", "username email")
        .populate("conversationId")
        .populate("messageId", "content createdAt")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({
        recipient: userId,
        isRead: false,
      }),
    ]);

    // ✅ Add memberCount manually (1 query per unique conversation)
    const conversationIds = [
      ...new Set(notifications.map((n) => n.conversationId?._id.toString())),
    ];

    const counts = await ConversationMember.aggregate([
      {
        $match: {
          conversationId: {
            $in: conversationIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
      { $group: { _id: "$conversationId", count: { $sum: 1 } } },
    ]);

    const countMap = Object.fromEntries(
      counts.map((c) => [c._id.toString(), c.count])
    );

    notifications.forEach((n) => {
      if (n.conversationId?._id) {
        n.conversationId.memberCount =
          countMap[n.conversationId._id.toString()] || 0;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        total,
        unreadCount,
        hasMore: skip + notifications.length < total,
        currentPage: Math.floor(skip / limit) + 1,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// ============================================================
//  MARK NOTIFICATION AS READ FOR A CONVERSATION
// ============================================================
export const markNotificationAsReadForConversation = async (req, res) => {
  try {
    const { userId, conversationId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ✅ Update all notifications for this conversation belonging to this user
    const result = await Notification.updateMany(
      {
        conversationId: conversationId,
        recipient: userId,
      },
      { isRead: true },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message:
        result.matchedCount === 0
          ? "No notifications found for this conversation"
          : `${result.modifiedCount} notification(s) marked as read`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error(
      "Error marking notifications as read for conversation:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Error marking notifications as read for conversation",
    });
  }
};

// ============================================================
//  MARK NOTIFICATION AS READ
// ============================================================
export const markNotificationAsRead = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: { notification },
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({
      success: false,
      message: "Error marking notification as read",
    });
  }
};

// ============================================================
//  DELETE ALL READ NOTIFICATIONS
// ============================================================
export const deleteAllReadNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const result = await Notification.deleteMany({
      recipient: userId,
      isRead: true,
    });

    return res.status(200).json({
      success: true,
      message: "All read notifications deleted",
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting notifications",
    });
  }
};
