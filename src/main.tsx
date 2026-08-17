import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./index.css";

// Same guard as src/lib/supabase.ts: a missing url must not throw during
// module init and take down every route with it.
const convexUrl =
  (import.meta.env.VITE_CONVEX_URL as string) || "https://placeholder.convex.cloud";

if (!import.meta.env.VITE_CONVEX_URL) {
  console.warn("[convex] VITE_CONVEX_URL is not set — Convex actions will not work.");
}

const convex = new ConvexReactClient(convexUrl);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <RouterProvider router={router} />
    </ConvexAuthProvider>
  </StrictMode>,
);
