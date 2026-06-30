import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useTheme } from "@/components/theme-provider";
import { ADMIN_EMAIL } from "@/hooks/use-approval";

const BLUE = "#0A66FF";

const NAV_LINKS = [
  { label: "Home", to: "/" as const, exact: true },
  { label: "Stores", to: "/stores" as const },
  { label: "Pricing", to: "/pricing" as const },
  { label: "Waitlist", to: "/waitlist" as const },
  { label: "Contact", to: "/contact" as const },
] as const;

export function Navbar({ variant: _variant = "light" }: { variant?: "light" | "dark" }) {
  const { signIn, signOut: convexSignOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const { session } = useSupabaseAuth();
  const { theme, toggleTheme } = useTheme();

  const signInWithGoogle = () =>
    void supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

  const signOutGoogle = () => void supabase.auth.signOut();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,.72)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "0 1px 0 rgba(0,0,0,.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Logo */}
        {/*<Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "-.02em",
            textDecoration: "none",
            color: "#0b0b0c",
            flexShrink: 0,
          }}
        >
          Swish
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: BLUE,
              display: "inline-block",
              marginBottom: 8,
            }}
          />
        </Link>*/}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <img 
            src="/your-logo.png" 
            alt="Swish Logo" 
            style={{ 
              height: 24, // Adjust this height to match your navbar's scaling
              width: "auto",
              display: "block"
            }} 
          />
        </Link>

        {/* Center nav */}
        <nav
          className="hidden md:flex"
          style={{ gap: 24, fontSize: 14, color: "#3f3f46", fontWeight: 450, display: "flex" }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={"exact" in link && link.exact ? { exact: true } : undefined}
              activeProps={{ style: { color: BLUE } }}
              className="mk-nlink"
              style={{ color: "#3f3f46" }}
            >
              {link.label}
            </Link>
          ))}
          {session && (
            <Link
              to="/dashboard"
              activeProps={{ style: { color: BLUE } }}
              className="mk-nlink"
              style={{ color: "#3f3f46" }}
            >
              Dashboard
            </Link>
          )}
          {session?.user.email?.toLowerCase() === ADMIN_EMAIL && (
            <Link
              to="/approvals"
              activeProps={{ style: { color: BLUE } }}
              className="mk-nlink"
              style={{ color: "#3f3f46" }}
            >
              Approvals
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9,
              border: "none",
              background: "rgba(0,0,0,.05)",
              cursor: "pointer",
              color: "#52525b",
            }}
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {session ? (
            <>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg,${BLUE},#6aa6ff)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {(session.user.email?.[0] ?? "U").toUpperCase()}
              </div>
              <button
                onClick={signOutGoogle}
                className="mk-btnp"
                style={{
                  padding: "7px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#0b0b0c",
                  background: "transparent",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)",
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={signInWithGoogle}
                className="mk-btnp"
                style={{
                  padding: "7px 13px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#0b0b0c",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Sign in
              </button>
              <button
                onClick={signInWithGoogle}
                className="mk-btnp"
                style={{
                  padding: "8px 15px",
                  borderRadius: 10,
                  background: "#0b0b0c",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px -8px rgba(0,0,0,.5)",
                }}
              >
                Get started →
              </button>
            </>
          )}

          {/* GitHub (admin) – subtle */}
          <button
            onClick={() => (isAuthenticated ? void convexSignOut() : void signIn("github"))}
            title={isAuthenticated ? "Admin sign out (GitHub)" : "Admin sign in (GitHub)"}
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 7,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#a1a1aa",
              opacity: 0.4,
              transition: "opacity .2s",
            }}
            className="hover:opacity-100"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
