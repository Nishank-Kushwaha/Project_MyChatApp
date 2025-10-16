import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/userSlice";
import axios from "axios";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

export default function Header() {
  const user = useSelector((state) => state.user.user);
  const isAuthenticated = useSelector((state) => state.user.loginStatus);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function getAvatarColor(username = "") {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const hash = username
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/logout`,
        { withCredentials: true }
      );
      console.log("Logout successful:", response);
      alert(`🎉 ${response.data.message}`);
      dispatch(logout());
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-white font-semibold text-lg"
          >
            <MessageCircle className="h-5 w-5" />
            <span>ChatApp</span>
          </Link>

          <nav className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/chat"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  Chats
                </Link>

                {/* ✅ Avatar from shadcn */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-300 hover:text-white text-sm transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    {user?.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.username} />
                    ) : (
                      <AvatarFallback
                        className={`${getAvatarColor(
                          user.username
                        )} text-white font-semibold`}
                      >
                        {user?.username
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span>{user?.username}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-red-400 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
