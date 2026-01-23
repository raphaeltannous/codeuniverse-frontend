import { Outlet } from "react-router";
import PlatformFooterComponent from "~/components/Platform/Footer";
import PlatformHeaderComponent from "~/components/Platform/Header";
import VerificationBanner from "~/components/Platform/VerificationBanner";

export default function LandingLayout() {
  return (
    <div>
      <PlatformHeaderComponent />
      <VerificationBanner />

      <Outlet />

      <PlatformFooterComponent />
    </div>
  )
}
