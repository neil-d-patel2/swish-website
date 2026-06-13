import { useState, useEffect } from "react";
import { WaitlistForm } from "@/components/waitlist-form";
import { Navbar } from "@/components/Navbar";

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


// ── Main component ────────────────────────────────────────────────────────────

export function VaultShieldHero() {
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
          <Navbar />

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

        </div>
      </div>
    </div>
  );
}
