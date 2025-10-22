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

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  // ✅ Define fetchNotifications first
  const fetchNotifications = async (nextPage = 0) => {
    try {
      const skip = nextPage * limit;
      const res = await getAllNotifications(user.id, {
        limit,
        skip,
        unreadOnly: false, // show all (you can toggle)
      });

      const data = res.data.data;
      console.log("response in fetch notifications:", data);

      if (nextPage === 0) {
        // first load
        dispatch(setNotifications(data.notifications));
      } else {
        // append more
        dispatch(setNotifications([...notifications, ...data.notifications]));
      }

      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.log("Error fetching notifications:", error);
    }
  };

  // ✅ Fetch when component loads or user changes
  useEffect(() => {
    fetchNotifications(0);
  }, [user.id, dispatch]);

  // ✅ When a notification is clicked
  const handleNotificationClick = async (notifyId, conversation) => {
    try {
      const res = markAsReadForConversation_api(user.id, conversation._id);
      console.log("response in mark as read:", res);
      dispatch(setActiveConversation(conversation));
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
        <div
          className="absolute mt-2 w-72 bg-white shadow-lg rounded-xl p-2 max-h-80 overflow-y-auto border border-gray-200 z-50"
          onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.target;
            if (scrollTop + clientHeight >= scrollHeight - 10 && hasMore) {
              fetchNotifications(page + 1);
            }
          }}
        >
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
          {hasMore && (
            <p className="text-center text-gray-400 text-xs py-1">
              Loading more...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
