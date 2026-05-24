import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AuthLoading } from "convex/react";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen" style={{ background: "#050508" }} />
      </AuthLoading>
      <Outlet />
    </>
  );
}
