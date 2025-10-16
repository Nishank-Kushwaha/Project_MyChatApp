import React from "react";
import { useSelector } from "react-redux";
import { MessageCircle, Mail, Calendar, User } from "lucide-react";

export default function Profile() {
  const { user, loginStatus } = useSelector((state) => state.user);

  console.log("user me:", user);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-gray-400">
        <p>No user data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-200 flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user.username?.[0]?.toUpperCase() || "U"}
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-white">
            {user.username}
          </h2>
          <span
            className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
              user.status === "online" || loginStatus
                ? "bg-green-600/20 text-green-400"
                : "bg-red-600/20 text-red-400"
            }`}
          >
            {user.status === "online" || loginStatus
              ? "🟢 Online"
              : "🔴 Offline"}
          </span>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-800"></div>

        {/* Info Section */}
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-400">
              <Mail size={16} /> Email
            </span>
            <span className="text-gray-200">{user.email || "—"}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-400">
              <Calendar size={16} /> Joined
            </span>
            <span className="text-gray-200">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "—"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-400">
              <MessageCircle size={16} /> Conversations
            </span>
            <span className="text-gray-200">
              {user.conversationCount ?? "0"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
