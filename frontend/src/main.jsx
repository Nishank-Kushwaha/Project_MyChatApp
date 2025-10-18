import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ReduxProvider from "./redux/ReduxProvider.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./components/react-components/Home.jsx";
import Register from "./components/react-components/Register.jsx";
import Login from "./components/react-components/login.jsx";
import Logout from "./components/react-components/Logout.jsx";
import Profile from "./components/react-components/Profile.jsx";
import PageNotFound from "./components/react-components/PageNotFound.jsx";
import ChatLayout from "./components/react-components/ChatLayout.jsx";
import PasswordResetFlow from "./components/react-components/PasswordResetFlow.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/logout",
        element: <Logout />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/reset-password/:type",
        element: <PasswordResetFlow />,
      },
      {
        path: "/chat",
        element: <ChatLayout />,
      },
      {
        path: "*",
        element: <PageNotFound />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ReduxProvider>
      <RouterProvider router={router} />
    </ReduxProvider>
  </StrictMode>
);
