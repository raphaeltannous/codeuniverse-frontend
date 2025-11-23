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
import PlatformAccountsPasswordResetRequest from "./pages/Platform/Accounts/PasswordResetRequest";
import PlatformAccountsPasswordReset from "./pages/Platform/Accounts/PasswordReset";
import PlatformAccountsLoginMFA from "./pages/Platform/Accounts/LoginMfa";
import PlatformAccountsEmailVerification from "./pages/Platform/Accounts/EmailVerification";

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
            { path: "login/mfa", element: <PlatformAccountsLoginMFA /> },
            { path: "signup", element: <PlatformAccountsSignup /> },
            { path: "signup/email-verification", element: <PlatformAccountsEmailVerification /> },
            { path: "password/request", element: <PlatformAccountsPasswordResetRequest /> },
            { path: "password/reset", element: <PlatformAccountsPasswordReset /> },
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
