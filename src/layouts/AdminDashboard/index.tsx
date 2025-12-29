import { Outlet } from "react-router";
import AdminDashboardHeaderComponent from "~/components/AdminDashboard/Header";
import { useUser } from "~/context/UserContext";

export default function DashboardLayout() {
  const { user, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4>Error Loading User Data</h4>
          <p>{error.message}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = "/login"}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div>
        Unauthorized.
      </div>
    )
  }


  return (
    <div className="d-flex flex-column min-vh-100">
      <AdminDashboardHeaderComponent />

      <main className="flex-grow-1">
        <Outlet />
      </main>

    </div>
  );
}
