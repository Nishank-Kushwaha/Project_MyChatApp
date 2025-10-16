import Conversation from "../models/Conversation.js";
import ConversationMember from "../models/ConversationMember.js";
import User from "../models/User.js";

/*
 * POST body: { userA: "<userId>", userB: "<userId>" }
 * Creates (or returns existing) a private conversation between two users.
 */

function getPrivateChatName(usernameA, usernameB) {
  const [first, second] = [
    usernameA.toLowerCase(),
    usernameB.toLowerCase(),
  ].sort();
  return `${first}<->${second}`;
}
const postPrivate = async (req, res) => {
  try {
    const { userA, userB } = req.body;

    if (!userA || !userB) {
      return res.status(400).json({ message: "userA and userB are required" });
    }
    if (userA === userB) {
      return res
        .status(400)
        .json({ message: "userA and userB must be different" });
    }

    // 1) find any existing private conversation that has both users
    // Get conversationIds for each user, then intersect
    const convIdsA = await ConversationMember.find({ userId: userA }).distinct(
      "conversationId"
    );
    const convIdsB = await ConversationMember.find({ userId: userB }).distinct(
      "conversationId"
    );

    const commonIds = convIdsA.filter((id) =>
      convIdsB.some((x) => x.toString() === id.toString())
    );

    if (commonIds.length > 0) {
      // ensure it's of type 'private'
      const existing = await Conversation.findOne({
        _id: commonIds[0],
        type: "private",
      });
      if (existing) {
        // return existing conversation with members
        const members = await ConversationMember.find({
          conversationId: existing._id,
        }).select("userId role joinedAt -_id");
        return res.status(200).json({
          message: "Private conversation exists",
          conversation: existing,
          members,
        });
      }
    }

    const res_a = await User.findById({ _id: userA });
    const res_b = await User.findById({ _id: userB });

    if (!res_a || !res_b) {
      return res.status(404).json({ message: "User not found" });
    }
    // 2️) Generate stable chat name (lexicographically sorted)
    const chatName = getPrivateChatName(res_a.username, res_b.username);

    // 3) create new conversation (private)
    const conv = await Conversation.create({
      type: "private",
      name: getPrivateChatName(res_a.username, res_b.username),
    });

    // 4) create conversation members
    await ConversationMember.insertMany([
      { conversationId: conv._id, userId: userA, role: "member" },
      { conversationId: conv._id, userId: userB, role: "member" },
    ]);

    const members = await ConversationMember.find({
      conversationId: conv._id,
    }).select("userId role joinedAt -_id");

    return res.status(201).json({
      message: "Private conversation created",
      conversation: conv,
      members,
    });
  } catch (error) {
    console.error("Error creating private conversation:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message || error });
  }
};

/**
 * POST body: {
 *   name: "Study Group",
 *   createdBy: "<userId>",
 *   members: ["<userId1>", "<userId2>", ...] // optional, should include createdBy
 * }
 *
 * Creates a group conversation and adds members.
 */
const postGroup = async (req, res) => {
  try {
    const { name, createdBy, members = [] } = req.body;

    if (!name || !createdBy) {
      return res
        .status(400)
        .json({ message: "name and createdBy are required" });
    }

    // ensure createdBy is in members
    const uniqueMembers = Array.from(new Set([createdBy, ...(members || [])]));

    // create conversation
    const conv = await Conversation.create({
      type: "group",
      name,
      createdBy,
    });

    // create ConversationMember docs (creator as admin)
    const memberDocs = uniqueMembers.map((u) => ({
      conversationId: conv._id,
      userId: u,
      role: u === createdBy ? "admin" : "member",
      joinedAt: new Date(),
    }));

    // insertMany with ordered:false to avoid stopping on duplicates (safe-guard)
    await ConversationMember.insertMany(memberDocs, { ordered: false });

    const createdMembers = await ConversationMember.find({
      conversationId: conv._id,
    }).select("userId role joinedAt -_id");

    return res.status(201).json({
      message: "Group created",
      conversation: conv,
      members: createdMembers,
    });
  } catch (error) {
    console.error("Error creating group conversation:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message || error });
  }
};

/**
 * POST body: { userId: "..." }  -> add member
 */
const postAddMember = async (req, res) => {
  try {
    const { id } = req.params; // conversationId
    const { userId } = req.body;

    const authUser = req.user;

    if (authUser) {
      return res
        .status(400)
        .json({ message: "Unauthorized: Missing user info" });
    }

    if (!userId) return res.status(400).json({ message: "userId required" });

    const conv = await Conversation.findById(id);
    if (!conv || conv.type !== "group")
      return res.status(404).json({ message: "Group not found" });

    // Only admin can add
    const isAdmin = await ConversationMember.exists({
      conversationId: id,
      userId: authUser.id,
      role: "admin",
    });
    if (!isAdmin) return res.status(403).json({ message: "Not authorized" });

    const existing = await ConversationMember.findOne({
      conversationId: id,
      userId,
    });
    if (existing)
      return res.status(400).json({ message: "User already a member" });

    const member = await ConversationMember.create({
      conversationId: id,
      userId,
      role: "member",
    });

    return res.status(201).json({ message: "Member added", member });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE body: { userId: "..." } -> remove member
 */
const postDeleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const authUser = req.user;

    const conv = await Conversation.findById(id);
    if (!conv)
      return res.status(404).json({ message: "Conversation not found" });

    const isAdmin = await ConversationMember.exists({
      conversationId: id,
      userId: authUser.id,
      role: "admin",
    });
    if (!isAdmin) return res.status(403).json({ message: "Not authorized" });

    await ConversationMember.deleteOne({ conversationId: id, userId });

    return res.status(200).json({ message: "Member removed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/conversations
 * Requires Authorization header: Bearer <jwt>
 * Returns all conversations where the user is a member
 */
const getAllConversation = async (req, res) => {
  try {
    const authUser = req.user;

    if (!authUser) {
      return res
        .status(400)
        .json({ message: "Unauthorized: Missing user info" });
    }

    // find all convIds where user is a member
    const convIds = await ConversationMember.find({
      userId: authUser.id,
    }).distinct("conversationId");

    // fetch conversation info
    const conversations = await Conversation.find({ _id: { $in: convIds } })
      .populate({
        path: "createdBy",
        select: "username email",
      })
      .lean();

    // optionally, attach member counts
    for (const conv of conversations) {
      conv.memberCount = await ConversationMember.countDocuments({
        conversationId: conv._id,
      });
    }

    return res.status(200).json({ conversations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export {
  postPrivate,
  postGroup,
  postAddMember,
  postDeleteMember,
  getAllConversation,
};
