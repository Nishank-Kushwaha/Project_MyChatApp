import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/react-components/Header";
import Footer from "./components/react-components/Footer";
import { Particles } from "./components/ui/particles.jsx";
import { useDispatch } from "react-redux";
import { login, logout } from "./redux/slices/userSlice.js";
import axios from "axios";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const restoreUser = async () => {
      // ⛔️ Don't check session if already on login or register pages
      if (["/login", "/register"].includes(location.pathname)) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
          { withCredentials: true }
        );

        console.log("fetch session response:", response);

        if (response.data.user) {
          dispatch(login(response.data.user));
          console.log("✅ User restored from token");
        }
      } catch (error) {
        console.log("⚠️ No valid session");
        dispatch(logout());
      }
    };

    restoreUser();
  }, [dispatch, location.pathname]); // 👈 also include location to re-run on route change

  return (
    <>
      <Header />
      <div className="relative min-h-screen w-full">
        {/* Particle Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Particles />
        </div>

        {/* Main Content */}
        <main className="relative z-10 min-h-screen w-full">
          <Outlet />
        </main>
      </div>
      <Footer />
    </>
  );
}

export default App;
