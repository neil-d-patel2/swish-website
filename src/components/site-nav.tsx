import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sun, Moon, Github } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function SiteNav({
  light,
  onToggle,
}: {
  light: boolean;
  onToggle: () => void;
}) {
  const { isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer);
  const [hovered, setHovered] = useState<string | null>(null);
  const { location } = useRouterState();

  return (
    <>
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-5 left-6 text-lg font-bold tracking-tight"
      style={{ zIndex: 30 }}
    >
      Swish
    </motion.span>
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex items-center justify-end max-w-5xl mx-auto px-6 py-6"
      style={{ zIndex: 20 }}
    >
      {isAuthenticated && (
        <div
          className={`hidden md:flex items-center gap-0.5 rounded-full px-1.5 py-1.5 mr-3 ${
            light
              ? "border border-black/[0.08] bg-black/[0.03]"
              : "border border-white/[0.07] bg-white/[0.025]"
          }`}
        >
          {[{ label: "Dashboard", to: "/dashboard" }].map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            const showPill = hovered === item.label || (!hovered && isActive);

            return (
              <Link
                key={item.label}
                to={item.to}
                className="relative px-4 py-1.5 text-sm rounded-full cursor-pointer"
                onMouseEnter={() => setHovered(item.label)}
                onMouseLeave={() => setHovered(null)}
              >
                {showPill && (
                  <motion.div
                    layoutId="site-nav-pill"
                    className={`absolute inset-0 rounded-full ${
                      light ? "bg-black/[0.06]" : "bg-white/[0.08]"
                    }`}
                    transition={{ type: "spring", bounce: 0.18, duration: 0.32 }}
                  />
                )}
                <span
                  className={`relative z-10 transition-colors duration-150 ${
                    isActive && !hovered
                      ? light
                        ? "text-gray-800"
                        : "text-white/80"
                      : light
                        ? "text-gray-400"
                        : "text-white/38"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer ${
            light
              ? "text-gray-500 hover:text-gray-900 hover:bg-black/[0.06]"
              : "text-white/45 hover:text-white hover:bg-white/[0.08]"
          }`}
          aria-label="Toggle light mode"
        >
          {light ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {viewer?.name && (
              <span className={`text-sm ${light ? "text-gray-500" : "text-white/45"}`}>
                {viewer.name}
              </span>
            )}
            <button
              onClick={() => void signOut()}
              className={`text-sm font-medium cursor-pointer transition-colors duration-200 ${
                light
                  ? "text-gray-500 hover:text-gray-900"
                  : "text-white/45 hover:text-white"
              }`}
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => void signIn("github")}
            className={`flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors duration-200 ${
              light
                ? "text-gray-500 hover:text-gray-900"
                : "text-white/45 hover:text-white"
            }`}
          >
            <Github className="w-4 h-4" /> Sign in
          </button>
        )}
      </div>
    </motion.nav>
    </>
  );
}
