import { Outlet } from "react-router";
import PlatformHeaderComponent from "../../components/Platform/Header";
import PlatformFooterComponent from "../../components/Platform/Footer";

export default function PlatformLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <PlatformHeaderComponent />

      <main className="flex-grow-1">
        <Outlet />
      </main>

      <PlatformFooterComponent />
    </div>
  )
}
