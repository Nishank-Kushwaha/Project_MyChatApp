import axios from "axios";
import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

function page() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/logout`,
        { withCredentials: true }
      );

      // console.log("Logout successfull:", response);
      alert(`🎉 ${response.data.message}`);

      dispatch(logout(response.data.data));
      navigate("/login");
    } catch (error) {
      console.error("Error in Logout process:", error);
      alert(`⚠️ ${error.response?.data?.message || error.message}`);
    }
  };
  return <button onClick={handleLogout}>Logout</button>;
}

export default page;
