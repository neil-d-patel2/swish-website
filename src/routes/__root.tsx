import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AuthLoading } from "convex/react";
import { ThemeProvider } from "@/components/theme-provider";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <ThemeProvider>
      <AuthLoading>
        <div className="min-h-screen" style={{ background: "#050508" }} />
      </AuthLoading>
      <Outlet />
    </ThemeProvider>
  );
}
