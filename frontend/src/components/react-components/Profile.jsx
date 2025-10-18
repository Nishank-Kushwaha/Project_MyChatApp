import React from "react";
import { useSelector } from "react-redux";
import { MessageCircle, Mail, Calendar, User, Key, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user, loginStatus } = useSelector((state) => state.user);

  // console.log("user me:", user);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <p className="text-gray-600">No user data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-10 px-6">
      <div className="w-full max-w-2xl">
        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>

          {/* Profile Content */}
          <div className="px-8 pb-8">
            {/* Avatar positioned to overlap header */}
            <div className="flex flex-col items-center -mt-16">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white">
                {user.username?.[0]?.toUpperCase() || "U"}
              </div>

              <h2 className="mt-4 text-3xl font-bold text-gray-900">
                {user.username}
              </h2>

              <span
                className={`mt-3 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm ${
                  user.status === "online" || loginStatus
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {user.status === "online" || loginStatus
                  ? "🟢 Online"
                  : "🔴 Offline"}
              </span>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-gray-200"></div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Email Address
                  </span>
                </div>
                <p className="text-gray-900 font-medium ml-13">
                  {user.email || "—"}
                </p>
              </div>

              {/* Join Date */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Member Since
                  </span>
                </div>
                <p className="text-gray-900 font-medium ml-13">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>

              {/* Conversations */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Conversations
                  </span>
                </div>
                <p className="text-gray-900 font-medium ml-13 text-2xl">
                  {user.conversationCount ?? "0"}
                </p>
              </div>

              {/* User ID */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    User ID
                  </span>
                </div>
                <p className="text-gray-900 font-medium ml-13 text-sm break-all">
                  {user._id || user.id || "—"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/reset-password/reset"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Key className="w-5 h-5" />
                Reset Password
              </Link>

              <button className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2 border border-gray-200 shadow-sm">
                <Shield className="w-5 h-5" />
                Security Settings
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Account Type</span>
              <span className="text-gray-900 font-medium">Standard User</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Last Login</span>
              <span className="text-gray-900 font-medium">Just now</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Account Status</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
