import { Outlet } from "react-router";
import PlatformHeaderComponent from "../../components/Platform/Header";
import PlatformFooterComponent from "../../components/Platform/Footer";
import VerificationBanner from "../../components/Platform/VerificationBanner";

export default function PlatformLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <PlatformHeaderComponent />
      <VerificationBanner />

      <main className="flex-grow-1">
        <Outlet />
      </main>

      <PlatformFooterComponent />
    </div>
  )
}
