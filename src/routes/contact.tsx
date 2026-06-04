import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function FadeIn({
  children,
  delay = 0,
  duration = 800,
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
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 1200));
    window.location.href = `mailto:npate137@jh.edu?subject=Swish%20Inquiry%20from%20${encodeURIComponent(name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
    setStatus("sent");
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="relative w-full min-h-screen overflow-hidden flex flex-col">

        {/* Video background */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
        />

        {/* Dark gradient overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.72) 100%)",
          }}
        />

        {/* Ambient glow blobs */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(115,66,226,0.12) 0%, transparent 70%)",
            top: "-10%",
            left: "-8%",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)",
            bottom: "0%",
            right: "-5%",
            filter: "blur(40px)",
          }}
        />

        {/* Content layer */}
        <div className="relative z-10 flex flex-col min-h-screen px-6 md:px-12 lg:px-16">

          {/* Navbar */}
          <div className="pt-6">
            <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
              <Link to="/" className="text-2xl font-semibold tracking-tight text-white">
                Swish
              </Link>
              <div className="hidden md:flex items-center gap-8">
                <Link to="/" className="text-sm text-white transition-colors hover:text-gray-300">
                  Home
                </Link>
                <Link to="/dashboard" className="text-sm text-white transition-colors hover:text-gray-300">
                  Dashboard
                </Link>
              </div>
              <Link
                to="/"
                className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back
              </Link>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="w-full max-w-lg">

              {/* Header */}
              <FadeIn delay={100} duration={900}>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-medium mb-3 text-center">
                  Get in touch
                </p>
                <h1
                  className="text-4xl md:text-5xl lg:text-6xl font-normal text-white text-center mb-3"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  Start a chat.
                </h1>
                <p className="text-base text-gray-400 text-center mb-10 leading-relaxed">
                  Interested in Swish? Tell us what you're building and we'll get back to you.
                </p>
              </FadeIn>

              {/* Glass card */}
              <FadeIn delay={300} duration={900}>
                <div
                  className="liquid-glass rounded-2xl border border-white/10 p-8"
                  style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.08)" }}
                >
                  {status === "sent" ? (
                    <div className="text-center py-8">
                      <div
                        className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                        style={{ background: "rgba(115,66,226,0.15)", border: "1px solid rgba(115,66,226,0.3)" }}
                      >
                        <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                      <p className="text-white text-lg font-medium mb-2">Message sent.</p>
                      <p className="text-gray-400 text-sm">We'll get back to you soon.</p>
                    </div>
                  ) : (
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

                      {/* Name + Email row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-white/50 font-medium uppercase tracking-wider">
                            Name <span className="text-purple-400">*</span>
                          </label>
                          <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:ring-1 focus:ring-purple-400/50"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.border = "1px solid rgba(115,66,226,0.5)";
                              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-white/50 font-medium uppercase tracking-wider">
                            Email <span className="text-purple-400">*</span>
                          </label>
                          <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.border = "1px solid rgba(115,66,226,0.5)";
                              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                            }}
                          />
                        </div>
                      </div>

                      {/* Message */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">
                          Message <span className="text-purple-400">*</span>
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Tell us about your project..."
                          className="rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all resize-none"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.border = "1px solid rgba(115,66,226,0.5)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                          }}
                        />
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="w-full py-3.5 rounded-lg text-sm font-medium text-white transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                          background: status === "sending"
                            ? "rgba(115,66,226,0.5)"
                            : "linear-gradient(135deg, rgba(115,66,226,0.9) 0%, rgba(37,99,235,0.9) 100%)",
                          boxShadow: status === "sending" ? "none" : "0 4px 24px rgba(115,66,226,0.3)",
                        }}
                        onMouseEnter={(e) => {
                          if (status !== "sending") {
                            e.currentTarget.style.boxShadow = "0 6px 32px rgba(115,66,226,0.5)";
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 4px 24px rgba(115,66,226,0.3)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        {status === "sending" ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Sending…
                          </span>
                        ) : (
                          "Send message →"
                        )}
                      </button>

                      {/* Alternative */}
                      <p className="text-center text-xs text-white/30 pt-1">
                        Or email us directly at{" "}
                        <a
                          href="mailto:npate137@jh.edu"
                          className="text-white/50 hover:text-white/80 transition-colors underline underline-offset-2"
                        >
                          npate137@jh.edu
                        </a>
                      </p>
                    </form>
                  )}
                </div>
              </FadeIn>

              {/* Trust badge */}
              <FadeIn delay={500} duration={900}>
                <div className="flex items-center justify-center gap-6 mt-8">
                  {[
                    { icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", label: "Fast response" },
                    { icon: "M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z", label: "Confidential" },
                    { icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z", label: "No spam" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-white/30">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                      </svg>
                      <span className="text-xs">{label}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
