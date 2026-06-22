import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4";
const SENSITIVITY = 0.8;
const CONTACT_EMAIL = "swishappdev@gmail.com";

const HEADING = "var(--font-heading)";
const BODY = "var(--font-body)";

const navLinks: { label: string; to: string }[] = [
  { label: "Home", to: "/" },
  { label: "Pricing", to: "/pricing" },
  { label: "Stores", to: "/stores" },
  { label: "Waitlist", to: "/waitlist" },
  { label: "Contact", to: "/contact" },
];

// Reveals `text` one character at a time after `startDelay`.
function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

// Scrubs the video forward/backward based on horizontal mouse movement,
// using `seeked` to queue the next seek and avoid flooding.
function useVideoScrub(videoRef: React.RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let prevX: number | null = null;
    let targetTime = 0;
    let seeking = false;

    const seek = () => {
      if (!video.duration) return;
      seeking = true;
      video.currentTime = targetTime;
    };

    const onSeeked = () => {
      if (Math.abs(video.currentTime - targetTime) > 0.01) {
        seek();
      } else {
        seeking = false;
      }
    };

    const onMove = (e: MouseEvent) => {
      if (!video.duration) return;
      if (prevX === null) {
        prevX = e.clientX;
        return;
      }
      const delta = e.clientX - prevX;
      prevX = e.clientX;
      targetTime = Math.min(
        Math.max(
          targetTime +
            (delta / window.innerWidth) * SENSITIVITY * video.duration,
          0,
        ),
        video.duration,
      );
      if (!seeking) seek();
    };

    window.addEventListener("mousemove", onMove);
    video.addEventListener("seeked", onSeeked);
    return () => {
      window.removeEventListener("mousemove", onMove);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [videoRef]);
}

const CopyIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="3.25"
      y="3.25"
      width="6.5"
      height="6.5"
      rx="1.25"
      stroke="currentColor"
      strokeWidth="1.1"
    />
    <rect
      x="1.75"
      y="1.75"
      width="6.5"
      height="6.5"
      rx="1.25"
      stroke="currentColor"
      strokeWidth="1.1"
      fill="none"
    />
  </svg>
);

const GoogleIcon = () => (
  <svg
    className="w-[18px] h-[18px] shrink-0"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export function SignInHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  useVideoScrub(videoRef);

  const { session } = useSupabaseAuth();
  const navigate = useNavigate();

  const signInWithGoogle = () =>
    void supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

  const { displayed, done } = useTypewriter(
    "Glad you stopped by. The big players have had the edge long enough — let's even the odds.",
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setActionsVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  const copyEmail = () => {
    void navigator.clipboard.writeText(CONTACT_EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signInWithGoogle();
  };

  // Force the first frame to paint without autoplaying.
  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (v) v.currentTime = 0.001;
  };

  const valueProps = [
    "AI store builder",
    "Real-time analytics",
    "Autonomous agents",
    "Live in minutes",
  ];

  const revealStyle = {
    opacity: actionsVisible ? 1 : 0,
    transform: actionsVisible ? "translateY(0)" : "translateY(8px)",
    transition: "opacity 0.4s ease, transform 0.4s ease",
  } as const;

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-white"
      style={{ fontFamily: BODY }}
    >
      {/* Background video (mouse-scrub controlled) */}
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={onLoadedMetadata}
        aria-hidden="true"
        className="fixed inset-0 z-0 h-full w-full"
        style={{ objectFit: "cover", objectPosition: "70% center" }}
      />

      {/* Left legibility wash so the black copy + form stay readable */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-white/85 via-white/35 to-transparent" />

      {/* Navbar */}
      <header className="fixed top-0 z-10 flex w-full items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <Link to="/" className="flex items-center gap-3">
          <span
            className="text-[21px] tracking-tight text-black sm:text-[26px]"
            style={{ fontFamily: HEADING }}
          >
            Swish(R)
          </span>
          <span
            className="select-none text-[25px] text-black sm:text-[30px]"
            style={{ letterSpacing: "-0.02em" }}
          >
            ✳︎
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-[23px] text-black md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="transition-opacity hover:opacity-60"
              activeProps={{ style: { color: "#2073FD" } }}
              activeOptions={link.to === "/" ? { exact: true } : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/contact"
          className="hidden text-[23px] text-black underline underline-offset-2 transition-opacity hover:opacity-60 md:block"
        >
          Get in touch
        </Link>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex flex-col gap-[5px] md:hidden"
        >
          <span
            className="h-[2px] w-6 bg-black transition-all duration-300"
            style={{
              transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="h-[2px] w-6 bg-black transition-all duration-300"
            style={{ opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="h-[2px] w-6 bg-black transition-all duration-300"
            style={{
              transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </header>

      {/* Mobile overlay */}
      <div
        className="fixed inset-0 z-[9] flex flex-col justify-center gap-8 bg-white/95 px-8 backdrop-blur-sm transition-opacity duration-300 md:hidden"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setMenuOpen(false)}
            className="text-[32px] font-medium text-black"
            activeProps={{ style: { color: "#2073FD" } }}
            activeOptions={link.to === "/" ? { exact: true } : undefined}
          >
            {link.label}
          </Link>
        ))}
        <Link
          to="/contact"
          onClick={() => setMenuOpen(false)}
          className="text-[32px] font-medium text-black underline underline-offset-2"
        >
          Get in touch
        </Link>
      </div>

      {/* Hero */}
      <section className="relative z-[1] flex h-screen flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0">
        <div className="relative z-10 max-w-xl">
          {/* Intro label */}
          <div
            className="mb-5 select-none sm:mb-6"
            style={{
              pointerEvents: "none",
              fontSize: "clamp(18px, 4vw, 26px)",
              lineHeight: 1.3,
              fontWeight: 400,
              color: "#000",
            }}
          >
            Hey there, welcome to Swish,
            <br />
            the AI platform built for small business
          </div>

          {/* Typewriter */}
          <p
            className="mb-5 sm:mb-6"
            style={{
              color: "#000",
              fontSize: "clamp(18px, 4vw, 26px)",
              lineHeight: 1.35,
              fontWeight: 400,
              minHeight: 54,
            }}
          >
            {displayed}
            {!done && (
              <span
                className="ml-[2px] inline-block h-[1.1em] w-[2px] bg-black align-middle"
                style={{ animation: "blink 1s step-end infinite" }}
              />
            )}
          </p>

          {/* CTA: sign in when signed out, go to dashboard when signed in */}
          {session ? (
            <div style={revealStyle}>
              <button
                onClick={() => void navigate({ to: "/dashboard" })}
                className="inline-flex items-center gap-2.5 rounded-full bg-black px-6 py-3 text-[15px] text-white shadow-sm transition-colors duration-200 hover:bg-black/85 sm:text-[17px]"
              >
                Go to dashboard
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>
              <p className="mt-2 text-[13px] text-black/60">
                Welcome back — pick up where you left off.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={revealStyle}>
              <button
                type="submit"
                className="inline-flex items-center gap-2.5 rounded-full border border-black/10 bg-white px-6 py-3 text-[15px] text-black shadow-sm transition-colors duration-200 hover:bg-black hover:text-white sm:text-[17px]"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <p className="mt-2 text-[13px] text-black/60">
                Free to start · No credit card required
              </p>
            </form>
          )}

          {/* Value props + copy-email pill */}
          <div className="mt-5 flex flex-wrap gap-y-1" style={revealStyle}>
            {valueProps.map((label) => (
              <span
                key={label}
                className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] text-black sm:px-5 sm:text-[15px]"
              >
                {label}
              </span>
            ))}
            <button
              onClick={copyEmail}
              aria-label={`Copy email ${CONTACT_EMAIL}`}
              className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-black bg-black px-4 py-[0.3em] text-[13px] text-white transition-colors duration-200 hover:bg-white hover:text-black sm:gap-3 sm:px-5 sm:text-[15px]"
            >
              <span>
                {copied ? "Copied!" : "Reach us: "}
                {!copied && (
                  <span className="underline underline-offset-1">
                    {CONTACT_EMAIL}
                  </span>
                )}
              </span>
              <CopyIcon />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
