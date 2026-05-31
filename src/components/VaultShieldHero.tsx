import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Link } from "@tanstack/react-router";
import { WaitlistForm } from "@/components/waitlist-form";

// ── FadeIn ────────────────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  duration = 1000,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{ opacity: visible ? 1 : 0, transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// ── AnimatedHeading ───────────────────────────────────────────────────────────

function AnimatedHeading({
  text,
  className = "",
  style = {},
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [animated, setAnimated] = useState(false);
  const charDelay = 30;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const lines = text.split("\n");

  return (
    <h1 className={className} style={style}>
      {lines.map((line, lineIndex) => {
        const lineLength = line.length;
        return (
          <span key={lineIndex} style={{ display: "block" }}>
            {line.split("").map((char, charIndex) => {
              const delay =
                lineIndex * lineLength * charDelay + charIndex * charDelay;
              return (
                <span
                  key={charIndex}
                  style={{
                    display: "inline-block",
                    opacity: animated ? 1 : 0,
                    transform: animated
                      ? "translateX(0)"
                      : "translateX(-18px)",
                    transition: `opacity 500ms ${delay}ms, transform 500ms ${delay}ms`,
                  }}
                >
                  {char === " " ? " " : char}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Platform", to: "/" },
  { label: "Agents", to: "/agents" },
  { label: "Analytics", to: "/analytics" },
  { label: "Pricing", to: "/pricing" },
] as const;

// ── Main component ────────────────────────────────────────────────────────────

export function VaultShieldHero() {
  const { signIn, signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* Video background */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
        />

        {/* Content layer */}
        <div className="relative z-10 flex flex-col min-h-screen px-6 md:px-12 lg:px-16">
          {/* Navbar */}
          <div className="pt-6">
            <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
              {/* Logo */}
              <span className="text-2xl font-semibold tracking-tight text-white">
                Swish
              </span>

              {/* Center links */}
              <div className="hidden md:flex items-center gap-8">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-sm text-white transition-colors hover:text-gray-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center justify-center bg-white text-black rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  style={{ width: 36, height: 36 }}
                  onClick={() =>
                    isAuthenticated ? void signOut() : void signIn("github")
                  }
                  title={isAuthenticated ? "Sign out" : "Sign in with GitHub"}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </button>
                <button
                  className="bg-white text-black px-6 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                  style={{ height: 36 }}
                  onClick={() =>
                    isAuthenticated ? void signOut() : void signIn("github")
                  }
                >
                  Start a Chat
                </button>
              </div>
            </nav>
          </div>

          {/* Hero content pushed to bottom */}
          <div className="flex-1 flex flex-col justify-end pb-12 lg:pb-16">
            <div className="lg:grid lg:grid-cols-2 lg:items-end">
              {/* Left column */}
              <div>
                <AnimatedHeading
                  text={"Build smarter\nsell without limits."}
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4 text-white"
                  style={{ letterSpacing: "-0.04em" }}
                />

                <FadeIn delay={800} duration={1000}>
                  <p className="text-base md:text-lg text-gray-300 mb-5">
                    Swish deploys AI agents that launch your store, surface what
                    drives growth, and run your marketing around the clock so
                    you can focus on what matters.
                  </p>
                </FadeIn>

                <FadeIn delay={1200} duration={1000}>
                  <div className="flex flex-wrap gap-4">
                    <button
                      className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() =>
                        !isAuthenticated && void signIn("github")
                      }
                    >
                      Start a Chat
                    </button>
                    <button className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors cursor-pointer">
                      Explore Now
                    </button>
                  </div>
                </FadeIn>
              </div>

              {/* Right column */}
              <FadeIn
                delay={1400}
                duration={1000}
                className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0"
              >
                <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                  <span className="text-lg md:text-xl lg:text-2xl font-light text-white">
                    Build. Analyze. Grow.
                  </span>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist section */}
      <div className="bg-black px-6 md:px-12 lg:px-16 py-24 flex flex-col items-center">
        <div className="liquid-glass border border-white/10 rounded-2xl px-8 py-12 w-full max-w-xl text-center">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-4 font-medium">
            Early Access
          </p>
          <h2
            className="text-3xl md:text-4xl font-normal text-white mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            Be first in line.
          </h2>
          <p className="text-base text-gray-400 mb-8 leading-relaxed">
            Swish is launching soon. Join the waitlist and get early access to
            AI powered tools that build your store, grow your revenue, and work
            while you sleep.
          </p>
          <WaitlistForm />

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30 shrink-0">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            className="mt-6 w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl border border-white/10 text-sm font-medium text-white/70 hover:text-white hover:border-white/20 hover:bg-white/5 transition-colors cursor-pointer"
            onClick={() =>
              isAuthenticated ? void signOut() : void signIn("github")
            }
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {isAuthenticated ? "Signed in with GitHub · Sign out" : "Continue with GitHub"}
          </button>
        </div>
      </div>
    </div>
  );
}
