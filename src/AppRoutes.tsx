import { createBrowserRouter } from "react-router";
import DashboardLayout from "./layouts/AdminDashboard";
import DashboardHome from "./pages/AdminDashboard/Home";
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
import PlatformProblems from "./pages/Platform/Problems";
import PlatformProblemsProblemset from "./pages/Platform/Problems/Problemset";
import PlatformProblemsProblem from "./pages/Platform/Problems/Problem";
import { authMiddleware } from "./middlewares/authentication";
import { guestOnly } from "./middlewares/guestonly";
import PlatformAccountsLogout from "./pages/Platform/Accounts/Logout";
import CoursesList from "./pages/Platform/Courses/CoursesList";
import PlatformCourses from "./pages/Platform/Courses";
import UserProfilePage from "./pages/Platform/Profile";
import DashboardCourses from "./pages/AdminDashboard/Courses";
import DashboardUsers from "./pages/AdminDashboard/Users";
import DashboardProblems from "./pages/AdminDashboard/Problems";

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
          path: "/accounts",
          middleware: [guestOnly],
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
        {
          path: "/accounts",
          element: <PlatformAccounts />,
          children: [
            { path: "logout", element: <PlatformAccountsLogout /> },
          ],
        },
        {
          path: "/problems",
          element: <PlatformProblems />,
          children: [
            { index: true, element: <PlatformProblemsProblemset /> },
            { path: ":problemSlug", middleware: [authMiddleware], element: <PlatformProblemsProblem /> }
          ]
        },
        {
          path: "/courses",
          element: <PlatformCourses />,
          children: [
            { index: true, element: <CoursesList /> },
            { path: ":courseId", }
          ],
        },
        {
          path: "/profile", middleware: [authMiddleware], element: <UserProfilePage />
        },
        {
          path: "/users/:username", element: <UserProfilePage />
        },
      ]
    },

    {
      path: "/dashboard",
      middleware: [authMiddleware],
      element: <DashboardLayout />,
      children: [
        { index: true, element: <DashboardHome /> },
        { path: "users", element: <DashboardUsers /> },
        { path: "courses", element: <DashboardCourses /> },
        { path: "problems", element: <DashboardProblems /> },
      ],
    },

    {
      path: "*",
      element: <div>Not Found</div>,
    },
  ]
)

export default AppRoutes;
