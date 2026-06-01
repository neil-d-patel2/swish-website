import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sun, Moon, Github } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

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
  const { session: supabaseSession, user: supabaseUser } = useSupabaseAuth();
  const [hovered, setHovered] = useState<string | null>(null);
  const { location } = useRouterState();

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

  const signOutGoogle = () => supabase.auth.signOut();

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
      {supabaseSession && (
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
                    layoutId="supabase-nav-pill"
                    className={`absolute inset-0 rounded-full ${light ? "bg-black/[0.06]" : "bg-white/[0.08]"}`}
                    transition={{ type: "spring", bounce: 0.18, duration: 0.32 }}
                  />
                )}
                <span
                  className={`relative z-10 transition-colors duration-150 ${
                    isActive && !hovered
                      ? light ? "text-gray-800" : "text-white/80"
                      : light ? "text-gray-400" : "text-white/38"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}

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

        {supabaseSession ? (
          <div className="flex items-center gap-3">
            {supabaseUser?.email && (
              <span className={`text-sm ${light ? "text-gray-500" : "text-white/45"}`}>
                {supabaseUser.email}
              </span>
            )}
            <button
              onClick={() => void signOutGoogle()}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium cursor-pointer rounded-full transition-colors duration-200 ${
                light
                  ? "text-gray-500 hover:text-gray-900 border border-black/[0.08] hover:bg-black/[0.06]"
                  : "text-white/45 hover:text-white border border-white/[0.07] hover:bg-white/[0.08]"
              }`}
            >
              <GoogleIcon className="w-4 h-4" /> Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => void signInWithGoogle()}
            className={`flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors duration-200 ${
              light
                ? "text-gray-500 hover:text-gray-900"
                : "text-white/45 hover:text-white"
            }`}
          >
            <GoogleIcon className="w-4 h-4" /> Sign in
          </button>
        )}

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
