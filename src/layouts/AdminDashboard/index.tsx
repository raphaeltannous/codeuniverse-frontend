import { Outlet } from "react-router";
import AdminDashboardHeaderComponent from "~/components/AdminDashboard/Header";
import DashboardSkeleton from "~/components/AdminDashboard/Home/DashboardSkeleton";
import UnauthorizedPage from "~/pages/AdminDashboard/Unauthorized";
import { useUser } from "~/context/UserContext";
import { Activity } from "react";

export default function DashboardLayout() {
  const { user, isLoading } = useUser();

  if (!isLoading && user?.role !== "admin") {
    return <UnauthorizedPage />;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <AdminDashboardHeaderComponent />

      <main className="flex-grow-1">
        <Activity mode={isLoading ? "visible" : "hidden"}>
          <DashboardSkeleton />
        </Activity>
        <Activity mode={isLoading ? "hidden" : "visible"}>
          <Outlet />
        </Activity>
      </main>

    </div>
  );
}
