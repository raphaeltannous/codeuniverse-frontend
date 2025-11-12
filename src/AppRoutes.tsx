import { createBrowserRouter } from "react-router";
import DashboardLayout from "./layouts/AdminDashboard";
import DashboardHome from "./pages/AdminDashboard/Home";
import DashboardSettings from "./pages/AdminDashboard/Settings";
import LandingLayout from "./layouts/Landing";
import LandingHome from "./pages/Landing/Home";
import PlatformLayout from "./layouts/Platform";
import PlatformAccounts from "./pages/Platform/Accounts";
import PlatformAccountsLogin from "./pages/Platform/Accounts/Login";
import PlatformAccountsSignup from "./pages/Platform/Accounts/Signup";

const AppRoutes = createBrowserRouter(
  [
    {
      path: "/",
      element: <LandingLayout />,
      children: [
        { index: true, element: <LandingHome /> },
      ]
    },

    {
      path: "/",
      element: <PlatformLayout />,
      children: [
        {
           path: "accounts",
           element: <PlatformAccounts />,
           children: [
             { index: true, element: <PlatformAccountsLogin /> },
             { path: "login", element: <PlatformAccountsLogin /> },
             { path: "signup", element: <PlatformAccountsSignup /> },
           ]
        },
      ]
    },

    {
      path: "/dashboard",
      element: <DashboardLayout />,
      children: [
        { index: true, element: <DashboardHome /> },
        { path: "settings", element: <DashboardSettings /> },
      ],
    },

    {
      path: "*",
      element: <div>Not Found</div>,
    },
  ]
)

export default AppRoutes;
