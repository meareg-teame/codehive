import { Outlet } from "react-router-dom";

/** Passthrough layout — pages keep their own Sidebar chrome. */
export function AppLayout() {
  return <Outlet />;
}
