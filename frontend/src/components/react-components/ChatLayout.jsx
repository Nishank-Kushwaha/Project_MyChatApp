import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Plus,
  Menu,
  X,
  MessageSquare,
  Users,
  User,
  UserPlus,
  Crown,
} from "lucide-react";
import {
  setConversations,
  setActiveConversation,
  setMessages,
  addMessage,
  addConversation,
} from "../../redux/slices/chatSlice.js";
import {
  fetchConversations,
  fetchMessages,
  createPrivateChat,
  createGroupChat,
  searchUsers,
  markAsReadForConversation_api,
} from "../../lib/api.js";
import {
  initSocket,
  joinConversation,
  leaveConversation,
  sendMessage,
  onNewMessage,
  offNewMessage,
  emitTyping,
  onTyping,
  offTyping,
} from "../../lib/socket.js";
import { markAsReadForConversation } from "../../redux/slices/notificationSlice.js";

const ChatMembersManager = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { activeConversation } = useSelector((state) => state.chat);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [allUsersInfo, setAllUsersInfo] = useState({});
  const [activeConversationInfo, setActiveConversationInfo] = useState({});
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);

  // ✅ Get current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setCurrentUserId(data.user?.id || data.user?._id);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  // ✅ Get all users info
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/users`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: null }),
          }
        );
        const data = await res.json();
        setAllUsersInfo(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

  // ✅ Get activeConversation info
  useEffect(() => {
    const fetchaActiveConversation = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/groups/details`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId: activeConversation._id }),
          }
        );
        const data = await res.json();
        setActiveConversationInfo(data);
      } catch (error) {
        console.error("Failed to fetchaActiveConversation:", error);
      }
    };
    fetchaActiveConversation();
  }, []);

  const [members, setMembers] = useState([]);

  // ✅ Prepare members list
  useEffect(() => {
    if (activeConversationInfo?.group?.members) {
      const formattedMembers = activeConversationInfo.group.members.map(
        (member) => ({
          id: member._id,
          name: member.username,
          isAdmin: activeConversationInfo.group.admins.some(
            (admin) => admin._id === member._id
          ),
        })
      );
      setMembers(formattedMembers);
    }
  }, [activeConversationInfo]);

  const [allUsers, setAllUsers] = useState([]);

  // ✅ Prepare all users list
  useEffect(() => {
    if (allUsersInfo?.users) {
      const formattedUsers = allUsersInfo.users.map((user) => ({
        id: user._id,
        name: user.username,
        email: user.email,
      }));

      setAllUsers(formattedUsers);
    }
  }, [activeConversationInfo]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  //✅ compute current user is admin once both are set
  useEffect(() => {
    if (!currentUserId || !activeConversationInfo) return;
    const admins = activeConversationInfo?.group?.admins || [];
    const isAdmin = admins.some(
      (a) => a._id === currentUserId || a.id === currentUserId
    );
    setCurrentUserIsAdmin(Boolean(isAdmin));
  }, [currentUserId, activeConversationInfo]);

  // API call to add member
  const handleAddMember = async (user) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/conversations/members/add/${
          activeConversation._id
        }`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        }
      );
      const data = await res.json();

      // console.log("handleAddMember -->", data);

      setMembers([...members, { ...user, isAdmin: false }]);
      setShowAddModal(false);
      setSearchTerm("");
    } catch (error) {}
  };

  // API call to remove member
  const handleRemoveMember = async (memberId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/conversations/members/delete/${
          activeConversation._id
        }`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: memberId }),
        }
      );
      const data = await res.json();

      // console.log("handleRemoveMember -->", data);

      setMembers(members.filter((m) => m.id !== memberId));
    } catch (error) {}
  };

  const availableUsers = allUsers.filter(
    (u) =>
      !members.some((m) => m.id === u.id) &&
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // console.log("✅ activeConversation :", activeConversation);
  // console.log("✅ currentUserId :", currentUserId);
  // console.log("✅ allUsersInfo :", allUsersInfo);
  // console.log("✅ activeConversationInfo :", activeConversationInfo);
  // console.log("✅ currentUserIsAdmin :", currentUserIsAdmin);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-gray-300 rounded-lg transition-colors group relative"
        title="Manage members"
      >
        <Users className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
          {activeConversation.memberCount}
        </span>
      </button>

      {/* Side Panel Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-transparent bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Side Panel */}
          <div className="ml-auto overflow-y-auto w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in z-40">
            {/* Panel Header */}
            <div className="flex-none border-b px-6 py-4 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  {activeConversation.type === "group" && (
                    <h2 className="text-lg font-bold text-gray-800">
                      {activeConversation.name}
                    </h2>
                  )}
                  <p className="text-sm text-gray-500">
                    {activeConversation.memberCount}{" "}
                    {activeConversation.memberCount === 1
                      ? "member"
                      : "members"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Add Member Button */}
            {activeConversation.type === "group" && currentUserIsAdmin && (
              <div className="flex-none px-6 py-4 border-b">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Member
                </button>
              </div>
            )}

            {/* Members List */}
            {activeConversation.type === "group" && (
              <div className="flex-1 overflow-y-auto scrollbar-custom">
                <div className="px-6 py-4 space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {member.avatar || getInitials(member.name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800">
                              {member.name}
                            </p>
                            {member.isAdmin && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {member.isAdmin ? "Admin" : "Member"}
                          </p>
                        </div>
                      </div>
                      {currentUserIsAdmin &&
                        activeConversation.type === "group" &&
                        !member.isAdmin &&
                        member.id !== currentUserId && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            title="Remove member"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeConversation.type === "private" && (
              <div className="flex-1 overflow-y-auto scrollbar-custom">
                <div className="px-6 py-4 space-y-3">
                  <div
                    key={activeConversation.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {activeConversation?.avatar ||
                          getInitials(activeConversation.name.split("<->")[0])}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800">
                            {activeConversation.name.split("<->")[0]}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">Member</p>
                      </div>
                    </div>
                  </div>
                  <div
                    key={activeConversation.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {activeConversation?.avatar ||
                          getInitials(activeConversation.name.split("<->")[1])}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800">
                            {activeConversation.name.split("<->")[1]}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">Member</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Add Member</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchTerm("");
                }}
                className="p-1 hover:bg-gray-100 rounded text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableUsers.length > 0 ? (
                availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAddMember(user)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                      {user.avatar || getInitials(user.name)}
                    </div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                  </button>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {searchTerm ? "No users found" : "No available users"}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        /* Custom Scrollbar Styles */
        .scrollbar-custom {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }

        .scrollbar-custom::-webkit-scrollbar {
          width: 8px;
        }

        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
          margin: 8px 0;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.7);
        }
      `}</style>
    </>
  );
};

const ConversationList = ({
  conversations,
  activeId,
  onSelect,
  currentUserName,
  currentUserId,
}) => (
  <div className="space-y-1">
    {conversations.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs mt-1">Click "New Chat" to start</p>
      </div>
    ) : (
      conversations.map((c) => {
        // 🧠 Get the current username in lowercase for matching
        const current = currentUserName?.toLowerCase();

        // 🧩 Determine display name (for private chats)
        let displayName = c.name;
        if (c.type === "private" && c.name?.includes("<->")) {
          const [first, second] = c.name.split("<->");
          if (first === current) displayName = second;
          else if (second === current) displayName = first;
        }

        // 🧩 Avatar letter (first letter of display name)
        const avatarLetter = displayName?.[0]?.toUpperCase() || "C";
        const dispatch = useDispatch();

        return (
          <div
            key={c._id}
            onClick={() => {
              onSelect(c);
              markAsReadForConversation_api(currentUserId, c._id);
              dispatch(markAsReadForConversation(c._id));
            }}
            className={`p-3 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors ${
              activeId === c._id ? "bg-blue-50 border-l-4 border-blue-500" : ""
            }`}
          >
            <div className="flex items-center gap-3 border border-blue-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
              {/* Avatar Circle */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow">
                {avatarLetter}
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {displayName}
                  </h3>

                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {c.lastMessageAt
                      ? new Date(c.lastMessageAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>

                <p className="text-sm text-gray-600 truncate">
                  {c.lastMessage || "No messages yet"}
                </p>
              </div>
            </div>
          </div>
        );
      })
    )}
  </div>
);

const NewChatModal = ({ isOpen, onClose, onCreateChat }) => {
  const [chatType, setChatType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setChatType(null);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedUsers([]);
      setGroupName("");
    }
  }, [isOpen]);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const results = await searchUsers(searchQuery);
          setSearchResults(results.users || results || []);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleUserSelect = (user) => {
    if (chatType === "private") {
      setSelectedUsers([user]);
    } else {
      if (selectedUsers.find((u) => u._id === user._id)) {
        setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
  };

  const handleCreate = async () => {
    if (loading) return;

    try {
      setLoading(true);
      let newChat;

      if (chatType === "private") {
        if (selectedUsers.length === 0) {
          alert("Please select a user");
          return;
        }
        newChat = await createPrivateChat(selectedUsers[0]._id);
      } else {
        if (selectedUsers.length === 0) {
          alert("Please select at least one member");
          return;
        }
        if (!groupName.trim()) {
          alert("Please enter a group name");
          return;
        }
        const memberIds = selectedUsers.map((u) => u._id);
        newChat = await createGroupChat(groupName, memberIds);
      }

      onCreateChat(newChat);
      onClose();
    } catch (error) {
      console.error("Failed to create chat:", error);
      alert("Failed to create chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">New Chat</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-300 rounded-full transition-colors bg-gray-100 text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!chatType ? (
            <div className="space-y-3">
              <button
                onClick={() => setChatType("private")}
                className="w-full p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-3"
              >
                <User className="w-6 h-6 text-blue-500" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Private Chat</h3>
                  <p className="text-sm text-gray-600">
                    Start a one-on-one conversation
                  </p>
                </div>
              </button>

              <button
                onClick={() => setChatType("group")}
                className="w-full p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-3"
              >
                <Users className="w-6 h-6 text-blue-500" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Group Chat</h3>
                  <p className="text-sm text-gray-600">
                    Create a group with multiple people
                  </p>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {chatType === "group" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter group name..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {chatType === "private" ? "Search User" : "Add Members"}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              {chatType === "group" && selectedUsers.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Selected ({selectedUsers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{user.username}</span>
                        <button
                          onClick={() => handleUserSelect(user)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.length === 0 && searchQuery ? (
                  <p className="text-center text-gray-500 py-4 text-sm">
                    No users found
                  </p>
                ) : (
                  searchResults.map((user) => {
                    const isSelected = selectedUsers.find(
                      (u) => u._id === user._id
                    );
                    return (
                      <div
                        key={user._id}
                        onClick={() => handleUserSelect(user)}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          isSelected ? "bg-blue-50 border-blue-500" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.username?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {user.username}
                            </p>
                            <p className="text-sm text-gray-600">
                              {user.email}
                            </p>
                          </div>
                          {isSelected && chatType === "group" && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {chatType && (
          <div className="flex gap-3 p-4 border-t">
            <button
              onClick={() => setChatType(null)}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || selectedUsers.length === 0}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Chat"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatWindow = ({ conversation, currentUserId, currentUserName }) => {
  const dispatch = useDispatch();
  const messages = useSelector(
    (state) => state.chat.messages[conversation?._id] || []
  );
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!conversation) return;

    (async () => {
      try {
        const res = await fetchMessages(conversation._id);
        dispatch(
          setMessages({
            conversationId: conversation._id,
            messages: res.messages || [],
          })
        );
        joinConversation(conversation._id);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    })();

    return () => {
      leaveConversation(conversation._id);
    };
  }, [conversation, dispatch]);

  // ✅ Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Typing indicator
  useEffect(() => {
    onTyping((data) => {
      if (data.conversationId === conversation?._id) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            if (!prev.includes(data.username)) return [...prev, data.username];
            return prev;
          } else {
            return prev.filter((u) => u !== data.username);
          }
        });
      }
    });
    return () => offTyping();
  }, [conversation]);

  // ✅ Handle typing
  const handleTyping = (e) => {
    setInput(e.target.value);
    if (typingTimeout) clearTimeout(typingTimeout);
    emitTyping(conversation._id, true);
    const timeout = setTimeout(() => emitTyping(conversation._id, false), 1000);
    setTypingTimeout(timeout);
  };

  // ✅ Send message
  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage({ conversationId: conversation._id, content: input.trim() });
    setInput("");
    emitTyping(conversation._id, false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation)
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">Select a chat</h2>
          <p className="text-gray-500">
            Choose a conversation to start messaging
          </p>
        </div>
      </div>
    );

  // 🧠 Get the current username in lowercase for matching
  const current = currentUserName?.toLowerCase();

  // 🧩 Determine display name (for private chats)
  let displayName = conversation.name;
  if (conversation.type === "private" && conversation.name?.includes("<->")) {
    const [first, second] = conversation.name.split("<->");
    if (first === current) displayName = second;
    else if (second === current) displayName = first;
  }

  // 🧩 Avatar letter (first letter of display name)
  const avatarLetter = displayName?.[0]?.toUpperCase() || "C";

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ✅ Fixed Header */}
      <div className="flex-none border-b px-6 py-4 flex items-center gap-3 justify-end bg-gray-200 shadow-sm">
        <div>
          <ChatMembersManager />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-md">
            {avatarLetter}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-lg tracking-tight">
              {displayName}
            </h2>
            <p className="text-xs text-gray-500">Active chat</p>
          </div>
        </div>
      </div>

      {/* ✅ Scrollable message list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((m) => {
            const isCurrentUser =
              m.senderId?._id === currentUserId ||
              m.sender?._id === currentUserId;
            return (
              <div
                key={m._id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-xs break-words ${
                    isCurrentUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {!isCurrentUser && (
                    <p className="text-xs font-semibold mb-1 opacity-75">
                      {m.senderId?.username || m.sender?.username || "Unknown"}
                    </p>
                  )}
                  <p>{m.content}</p>
                  <span className="text-xs opacity-75 block mt-1">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-2xl text-sm">
              <em>
                {typingUsers.join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing...
              </em>
            </div>
          </div>
        )}

        {/* Invisible element to auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* ✅ Fixed Input Bar */}
      <div className="flex-none border-t px-6 py-4 bg-white">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
          <button
            onClick={handleSend}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ChatLayout() {
  const dispatch = useDispatch();
  const { conversations, activeConversation } = useSelector(
    (state) => state.chat
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(null);

  // ✅ Get current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setCurrentUserId(data.user?.id || data.user?._id);
        setCurrentUserName(data.user?.username);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  // ✅ Initialize socket and listen for new messages
  useEffect(() => {
    const socket = initSocket();

    if (!socket) {
      console.error("Failed to initialize socket");
      return;
    }

    onNewMessage((msg) => {
      if (!msg) return;
      // console.log("📨 New message received:", msg);
      dispatch(
        addMessage({ conversationId: msg.conversationId, message: msg })
      );
    });

    return () => {
      offNewMessage();
    };
  }, [dispatch]);

  // ✅ Fetch conversations on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchConversations();
        // console.log("Fetched conversations:", res);
        dispatch(setConversations(res.conversations || res || []));
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        dispatch(setConversations([]));
      }
    })();
  }, [dispatch]);

  const handleNewChat = (newChat) => {
    dispatch(addConversation(newChat.conversation || newChat));
    dispatch(setActiveConversation(newChat.conversation || newChat));
  };

  const searchConversations = async (searchQuery, conversations) => {
    const query = searchQuery.trim().toLowerCase();

    // 1️⃣ If search is empty → restore all from backend
    if (!query) {
      try {
        const res = await fetchConversations();
        dispatch(setConversations(res.conversations || res || []));
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        dispatch(setConversations([]));
      }
      return;
    }

    // 2️⃣ Filter locally (case-insensitive)
    const filteredConversations = conversations.filter((c) => {
      let displayName = c.name?.toLowerCase() || "";

      if (c.type === "private" && c.name.includes("<->")) {
        const [first, second] = c.name.split("<->");
        const current = currentUserName.toLowerCase();
        displayName = first === current ? second : first;
      }

      return displayName.includes(query);
    });

    // 3️⃣ Dispatch filtered results
    dispatch(setConversations(filteredConversations));
  };

  let searchTimeout;

  const handleSearchConversation = (e) => {
    clearTimeout(searchTimeout);
    const value = e.target.value;
    searchTimeout = setTimeout(() => {
      searchConversations(value, conversations);
    }, 250);
  };

  return (
    <div className="relative flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-96" : "w-0"
        } transition-all duration-300 bg-gray-200 border-r flex flex-col overflow-hidden
      ${sidebarOpen ? "absolute z-50 left-0 top-0 h-full shadow-lg" : ""}`}
      >
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Chats</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 bg-gray-100 hover:bg-gray-400 rounded-full text-black font-bold text-xl shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
              onChange={handleSearchConversation}
            />
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => setShowNewChatModal(true)}
            className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <ConversationList
            conversations={conversations}
            activeId={activeConversation?._id}
            onSelect={(c) => dispatch(setActiveConversation(c))}
            currentUserName={currentUserName}
            currentUserId={currentUserId}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-10 p-2 bg-gray-100 rounded-full shadow-lg hover:bg-gray-300 text-black font-bold text-xl"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <ChatWindow
          conversation={activeConversation}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onCreateChat={handleNewChat}
      />
    </div>
  );
}
