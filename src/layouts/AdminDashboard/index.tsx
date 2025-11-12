import { Outlet, NavLink } from "react-router";

export default function DashboardLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          background: "#f4f4f4",
          padding: "1rem",
          borderRight: "1px solid #ddd",
        }}
      >
        <h2>Dashboard</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <NavLink to="/dashboard" end>
            Home
          </NavLink>
          <NavLink to="/dashboard/settings">Settings</NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "1.5rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
