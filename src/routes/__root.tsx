import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import SignInButton from "@/components/sign-in-button";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen" style={{ background: "#050508" }} />
      </AuthLoading>

      <Authenticated>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
              <Link to="/" className="text-2xl font-bold tracking-tight">
                Swish
              </Link>
              <SignInButton />
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </Authenticated>

      <Unauthenticated>
        <Outlet />
      </Unauthenticated>
    </>
  );
}
