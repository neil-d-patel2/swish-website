import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/waitlist")({
  component: WaitlistPage,
});

// Cream + black design system (shared with pricing/contact)
const creamCard = "#FBF8F1";
const ink = "#000000";
const muted = "rgba(0,0,0,0.6)";
const heading = "var(--font-heading)";
const body = "var(--font-body)";
const hairline = "inset 0 0 0 1px rgba(0,0,0,0.1)";

function WaitlistPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#E5E7E9", color: ink, fontFamily: body }}
    >
      <div className="px-6 md:px-12 lg:px-16">
        <Navbar variant="light" />
      </div>

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-20 flex items-center justify-center">
        <div
          className="w-full max-w-xl rounded-2xl px-8 py-12 md:px-12 text-center"
          style={{
            background: "#ffffff",
            boxShadow: `${hairline}, 0 8px 30px rgb(0 0 0 / 0.05)`,
          }}
        >
          <p
            className="text-xs uppercase tracking-[0.18em] font-medium mb-4"
            style={{ fontFamily: body, color: muted }}
          >
            Early Access
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: heading, color: ink }}
          >
            Be first in line.
          </h1>
          <p
            className="text-base leading-relaxed mb-8"
            style={{ color: muted }}
          >
            Swish is launching soon. Join the waitlist and get early access to
            AI powered tools that build your store, grow your revenue, and work
            while you sleep.
          </p>
          <WaitlistForm />
        </div>
      </main>

      {/* Footer */}
      <footer
        className="w-full py-16 border-t mt-auto"
        style={{ background: "#ffffff", borderColor: "rgba(0,0,0,0.1)" }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 lg:px-16 max-w-6xl mx-auto gap-8">
          <div
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: heading, color: ink }}
          >
            Swish
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Security", "Status"].map(
              (l) => (
                <a
                  key={l}
                  href="#"
                  className="text-sm transition-opacity hover:opacity-60"
                  style={{ fontFamily: body, color: muted }}
                >
                  {l}
                </a>
              ),
            )}
          </div>
          <div className="text-sm" style={{ fontFamily: body, color: muted }}>
            © 2026 Swish Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

type State = "idle" | "loading" | "success" | "duplicate" | "error";

const MESSAGE: Record<Exclude<State, "idle" | "loading">, string> = {
  success: "You're on the list! We'll be in touch soon.",
  duplicate: "You're already on the waitlist! We'll be in touch.",
  error: "Something went wrong. Please try again.",
};

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const joinWaitlist = useMutation(api.waitlist.join);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (state === "loading" || state === "success") return;
      setState("loading");
      try {
        await joinWaitlist({ email });
        setState("success");
        setEmail("");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        setState(msg.includes("already_registered") ? "duplicate" : "error");
        setTimeout(() => setState("idle"), 3500);
      }
    },
    [email, state, joinWaitlist],
  );

  if (state === "success") {
    return (
      <div
        className="flex items-center justify-center gap-3 px-5 py-4 rounded-xl"
        style={{ background: creamCard, boxShadow: hairline }}
      >
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ background: ink }}
        >
          <Check className="w-4 h-4" style={{ color: "#ffffff" }} />
        </span>
        <span className="text-sm" style={{ color: ink }}>
          {MESSAGE.success}
        </span>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="flex-1 rounded-full px-5 py-3 outline-none transition-shadow focus:ring-1 focus:ring-black"
          style={{
            background: creamCard,
            color: ink,
            fontFamily: body,
            boxShadow: hairline,
          }}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium shrink-0 transition-transform active:scale-95 disabled:opacity-70 cursor-pointer"
          style={{ fontFamily: body, color: "#ffffff", background: ink }}
        >
          {state === "loading" ? (
            "Joining..."
          ) : (
            <>
              Join waitlist
              <ArrowRight className="w-4 h-4 opacity-70" />
            </>
          )}
        </button>
      </form>

      {(state === "duplicate" || state === "error") && (
        <p
          className="mt-3 text-sm"
          style={{ color: state === "error" ? "#ba1a1a" : muted }}
        >
          {MESSAGE[state]}
        </p>
      )}

      <p className="mt-4 text-xs" style={{ color: muted }}>
        No spam. Unsubscribe any time.
      </p>
    </>
  );
}
