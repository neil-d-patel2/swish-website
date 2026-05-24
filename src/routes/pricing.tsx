import { createFileRoute } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

const VIOLET = "139,92,246";
const BLUE = "59,130,246";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const TIERS = [
  {
    name: "Starter",
    price: "Free",
    sub: "Get started at no cost",
    accent: BLUE,
    accentHex: "#3B82F6",
    features: ["1 store", "AI Store Builder", "Basic analytics", "Email support"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    sub: "per month",
    accent: VIOLET,
    accentHex: "#8B5CF6",
    features: ["3 stores", "All 6 AI Agents", "Advanced analytics", "Priority support", "Custom domain"],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    sub: "tailored to your scale",
    accent: "16,185,129",
    accentHex: "#10B981",
    features: ["Unlimited stores", "Dedicated agents", "White-label options", "SLA & compliance", "Dedicated CSM"],
    cta: "Contact sales",
    highlighted: false,
  },
];

function PricingContent({ light }: { light: boolean }) {
  return (
    <div className="relative max-w-5xl mx-auto px-6 pb-24" style={{ zIndex: 10 }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-center pt-16 pb-16"
      >
        <h1 className={`text-5xl font-bold tracking-tighter mb-4 ${light ? "text-gray-900" : "text-white"}`}>
          Simple, transparent pricing
        </h1>
        <p className={`text-base max-w-sm mx-auto leading-relaxed ${light ? "text-gray-500" : "text-white/40"}`}>
          One plan for every stage of your business. Upgrade or downgrade at any time.
        </p>
        <span
          className="inline-flex items-center gap-1.5 mt-5 text-[11px] font-medium tracking-widest uppercase rounded-full px-4 py-1.5"
          style={{ background: `rgba(${VIOLET},0.1)`, border: `1px solid rgba(${VIOLET},0.2)`, color: "#8B5CF6" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Coming soon
        </span>
      </motion.div>

      {/* Pricing tiers */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
          hidden: {},
        }}
      >
        {TIERS.map((tier) => (
          <motion.div
            key={tier.name}
            variants={{
              hidden: { opacity: 0, y: 24, scale: 0.96 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.35, duration: 0.7 } },
            }}
            className={`relative rounded-2xl p-6 flex flex-col ${
              tier.highlighted
                ? ""
                : light
                  ? "border border-black/[0.07] bg-black/[0.025]"
                  : "border border-white/[0.06] bg-white/[0.02]"
            }`}
            style={
              tier.highlighted
                ? {
                    background: `linear-gradient(135deg, rgba(${VIOLET},0.1), rgba(${BLUE},0.08))`,
                    border: `1px solid rgba(${VIOLET},0.3)`,
                  }
                : {}
            }
          >
            {tier.highlighted && (
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-widest uppercase rounded-full px-3 py-1"
                style={{ background: `rgba(${VIOLET},0.9)`, color: "#fff" }}
              >
                Most popular
              </span>
            )}

            <div className="mb-5">
              <p className={`text-xs font-semibold uppercase tracking-widest mb-2`} style={{ color: tier.accentHex }}>
                {tier.name}
              </p>
              <p className={`text-3xl font-bold tracking-tight ${light ? "text-gray-900" : "text-white"}`}>
                {tier.price}
              </p>
              <p className={`text-xs mt-0.5 ${light ? "text-gray-400" : "text-white/28"}`}>{tier.sub}</p>
            </div>

            <ul className="flex flex-col gap-2.5 mb-7 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: tier.accentHex }} />
                  <span className={`text-sm ${light ? "text-gray-600" : "text-white/50"}`}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity duration-150 opacity-60 cursor-not-allowed"
              style={
                tier.highlighted
                  ? { background: `rgba(${VIOLET},0.9)`, color: "#fff" }
                  : light
                    ? { background: "rgba(0,0,0,0.07)", color: "#374151" }
                    : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }
              }
              disabled
            >
              {tier.cta}
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function SignInPrompt({ light }: { light: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div
        className="inline-flex w-14 h-14 items-center justify-center rounded-2xl mb-6"
        style={{ background: `rgba(${VIOLET},0.1)`, border: `1px solid rgba(${VIOLET},0.2)` }}
      >
        <Lock className="w-6 h-6" style={{ color: "#8B5CF6" }} />
      </div>
      <h2 className={`text-2xl font-bold tracking-tight mb-2 ${light ? "text-gray-900" : "text-white"}`}>Sign in required</h2>
      <p className={`text-sm ${light ? "text-gray-500" : "text-white/40"}`}>Sign in to view pricing.</p>
    </div>
  );
}

function PricingPage() {
  const { light, toggle } = useTheme();
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${light ? "text-gray-900" : "text-white"}`}
      style={{ background: light ? "#f8f9fc" : "#050508" }}
    >
      <div
        className="fixed pointer-events-none rounded-full"
        style={{
          zIndex: 0, width: 600, height: 600,
          background: `radial-gradient(circle, rgba(${VIOLET},0.07) 0%, transparent 65%)`,
          bottom: -200, left: "50%", transform: "translateX(-50%)", filter: "blur(40px)",
        }}
      />

      <SiteNav light={light} onToggle={toggle} />

      {isLoading ? null : isAuthenticated ? (
        <PricingContent light={light} />
      ) : (
        <SignInPrompt light={light} />
      )}

      <footer
        className={`relative text-center py-8 text-xs ${light ? "text-gray-400 border-t border-black/[0.06]" : "text-white/15 border-t border-white/[0.04]"}`}
        style={{ zIndex: 10 }}
      >
        © 2025 Swish · Built with AI
      </footer>
    </div>
  );
}
