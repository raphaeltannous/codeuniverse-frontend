import { createBrowserRouter } from "react-router";
import DashboardLayout from "./layouts/AdminDashboard";
import AdminDashboardHome from "./pages/AdminDashboard/Home";
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
import { guestOnly } from "./middlewares/guestonly";
import PlatformAccountsLogout from "./pages/Platform/Accounts/Logout";
import CoursesList from "./pages/Platform/Courses/CoursesList";
import PlatformCourses from "./pages/Platform/Courses";
import UserProfilePage from "./pages/Platform/Profile";
import DashboardCourses from "./pages/AdminDashboard/Courses";
import LessonsDashboard from "./pages/AdminDashboard/Lessons";
import CourseLessonsPagee from "./pages/Platform/Courses/Lessons";
import UsersDashboard from "./pages/AdminDashboard/Users";
import ProblemsDashboard from "./pages/AdminDashboard/Problems";
import EditProblemPage from "./pages/AdminDashboard/Problem";

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
            { path: "password/request", element: <PlatformAccountsPasswordResetRequest /> },
            { path: "password/reset", element: <PlatformAccountsPasswordReset /> },
          ]
        },
        {
          path: "/accounts",
          element: <PlatformAccounts />,
          children: [
            { path: "logout", element: <PlatformAccountsLogout /> },
            { path: "signup/email-verification", element: <PlatformAccountsEmailVerification /> },
          ],
        },
        {
          path: "/problems",
          element: <PlatformProblems />,
          children: [
            { index: true, element: <PlatformProblemsProblemset /> },
            { path: ":problemSlug",  element: <PlatformProblemsProblem /> }
          ]
        },
        {
          path: "/courses",
          element: <PlatformCourses />,
          children: [
            { index: true, element: <CoursesList /> },
            { path: ":courseSlug",  element: <CourseLessonsPagee /> }
          ],
        },
        {
          path: "/profile",  element: <UserProfilePage />
        },
        {
          path: "/users/:username", element: <UserProfilePage />
        },
      ]
    },

    {
      path: "/dashboard",
      
      element: <DashboardLayout />,
      children: [
        { index: true, element: <AdminDashboardHome /> },
        { path: "users", element: <UsersDashboard /> },
        {
          path: "courses",
          element: <PlatformCourses />,
          children: [
            { index: true, element: <DashboardCourses /> },
            { path: ":courseSlug", element: <LessonsDashboard /> },
          ]
        },
        { path: "problems",
          element: <PlatformProblems />,
          children: [
            { index: true, element: <ProblemsDashboard /> },
            { path: ":slug/edit", element: <EditProblemPage /> }
          ],
        },
      ],
    },

    {
      path: "*",
      element: <div>Not Found</div>,
    },
  ]
)

export default AppRoutes;
