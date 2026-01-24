import { Outlet } from "react-router";
import AdminDashboardHeaderComponent from "~/components/AdminDashboard/Header";
import UnauthorizedPage from "~/pages/AdminDashboard/Unauthorized";
import { useUser } from "~/context/UserContext";
import VerificationBanner from "~/components/Platform/VerificationBanner";

export default function DashboardLayout() {
  const { user, isLoading } = useUser();

  if (!isLoading && user?.role !== "admin") {
    return <UnauthorizedPage />;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <AdminDashboardHeaderComponent />
      <VerificationBanner />

      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
}
