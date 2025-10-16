import mongoose from "mongoose";

const conversationMemberSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicates (same user in same conversation)
conversationMemberSchema.index(
  { conversationId: 1, userId: 1 },
  { unique: true }
);

export default mongoose.models.ConversationMember ||
  mongoose.model("ConversationMember", conversationMemberSchema);
