import Group from "../models/Group.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";

const getGroupDetails = async (req, res) => {
  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId is required" });
    }

    // Find the group
    const group = await Group.findOne({ conversationId })
      .populate({
        path: "admins",
        select: "_id username email",
      })
      .populate({
        path: "members",
        select: "_id username email",
      });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Optionally, also get conversation info (like name, createdBy)
    const conversation = await Conversation.findById(conversationId).select(
      "_id name createdBy"
    );

    return res.status(200).json({
      conversation,
      group,
    });
  } catch (error) {
    console.error("Error fetching group details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export { getGroupDetails };
