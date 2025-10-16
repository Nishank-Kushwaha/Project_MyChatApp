import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import ConversationMember from "../models/ConversationMember.js";

/**
 * GET /api/messages/:conversationId?page=1&limit=50
 * Fetch paginated messages for a conversation
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const authUser = req.user; // extracted via auth middleware

    // ✅ Check if user is a member of this conversation
    const isMember = await ConversationMember.exists({
      conversationId,
      userId: authUser.id,
    });
    if (!isMember)
      return res.status(403).json({ message: "Access denied to conversation" });

    // ✅ Fetch messages
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("senderId", "username email") // optional
      .lean();

    // ✅ Get total count for pagination
    const totalMessages = await Message.countDocuments({ conversationId });

    return res.status(200).json({
      page,
      limit,
      total: totalMessages,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export { getMessages };
