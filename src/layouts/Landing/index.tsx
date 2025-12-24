import { Outlet } from "react-router";
import PlatformFooterComponent from "~/components/Platform/Footer";
import PlatformHeaderComponent from "~/components/Platform/Header";

export default function LandingLayout() {
  return (
    <div>
      <PlatformHeaderComponent />

      <Outlet />

      <PlatformFooterComponent />
    </div>
  )
}
