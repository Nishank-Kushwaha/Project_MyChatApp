// src/components/Notifications.jsx
import { useSelector, useDispatch } from "react-redux";
import {
  markAsReadForConversation,
  setNotifications,
} from "../../redux/slices/notificationSlice.js";
import { setActiveConversation } from "../../redux/slices/chatSlice.js";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  getAllNotifications,
  markAsRead_api,
  deleteAllRead,
  markAsReadForConversation_api,
} from "../../lib/api.js";

export default function Notifications() {
  const { notifications, unreadCount } = useSelector(
    (state) => state.notification
  );
  const { user, loginStatus } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [seeNotify, setSeeNotify] = useState(false);

  // ✅ Define fetchNotifications first
  const fetchNotifications = async () => {
    try {
      const res = await getAllNotifications(user.id, {
        limit: 20,
        skip: 0,
        unreadOnly: true,
      });
      console.log("response in fetch notifications:", res.data.data);
      dispatch(setNotifications(res.data.data.notifications));
    } catch (error) {
      console.log("Error fetching notifications:", error);
    }
  };

  // ✅ Fetch when component loads or user changes
  useEffect(() => {
    fetchNotifications();
  }, [user.id, dispatch]);

  // ✅ When a notification is clicked
  const handleNotificationClick = async (notifyId, conversation) => {
    try {
      const res = await markAsRead_api(user.id, notifyId);
      console.log("response in mark as read:", res);
      dispatch(setActiveConversation(conversation));
      markAsReadForConversation_api(user.id, conversation._id);
      dispatch(markAsReadForConversation(conversation._id));
      setSeeNotify(false);
    } catch (error) {
      console.log("Error in mark as read:", error);
    }
  };

  // ✅ Create a function to delete and refresh
  const deleteAllReadNotifications = async () => {
    try {
      const res = await deleteAllRead(user.id);
      console.log("response in delete all read:", res.data.data);

      // 🔁 Refresh notifications after deleting
      await fetchNotifications();
    } catch (error) {
      console.log("Error in delete all read:", error);
    }
  };

  // ✅ Delete and refresh
  useEffect(() => {
    deleteAllReadNotifications();
  }, []);

  return (
    <div className="relative">
      <button
        className="relative bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition"
        onClick={() => setSeeNotify((prev) => !prev)}
      >
        <Bell className="w-6 h-6 text-gray-700" />

        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white 
                       text-[10px] font-semibold rounded-full 
                       px-[5px] py-[1px] min-w-[16px] text-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {seeNotify && (
        <div className="absolute mt-2 w-72 bg-white shadow-lg rounded-xl p-2 max-h-80 overflow-y-auto border border-gray-200 z-50">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm text-center">
              No notifications yet
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n._id, n.conversationId)}
                className={`p-2 mb-1 rounded-lg cursor-pointer ${
                  n.isRead ? "bg-green-100" : "bg-blue-50"
                }`}
              >
                <p className="text-sm font-medium text-black">
                  New message from{" "}
                  <span className="font-bold ">
                    {n.sender?.username || "Someone"}
                  </span>
                </p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <p>{n.content}</p>
                  <p>
                    {n.createdAt
                      ? new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
