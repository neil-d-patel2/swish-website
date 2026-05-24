import { createFileRoute } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { motion } from "framer-motion";
import { Bot, Search, Megaphone, Mail, Package, HeadphonesIcon, TrendingUp, Lock } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/agents")({
  component: AgentsPage,
});

const VIOLET = "139,92,246";
const BLUE = "59,130,246";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const AGENTS = [
  { Icon: Search, label: "SEO Agent", desc: "Optimizes your store for search engines around the clock, building organic traffic on autopilot.", accent: VIOLET },
  { Icon: Megaphone, label: "Ads Agent", desc: "Manages and optimizes paid campaigns across Google and Meta, maximizing ROAS automatically.", accent: BLUE },
  { Icon: Mail, label: "Email Agent", desc: "Crafts and sends personalized email sequences that convert browsers into repeat buyers.", accent: "16,185,129" },
  { Icon: Package, label: "Inventory Agent", desc: "Monitors stock levels, predicts demand, and triggers restocks before you run out.", accent: VIOLET },
  { Icon: HeadphonesIcon, label: "Support Agent", desc: "Handles customer queries 24/7 with human-quality responses and automatic escalation.", accent: BLUE },
  { Icon: TrendingUp, label: "Pricing Agent", desc: "Dynamically adjusts prices based on demand, competition, and inventory to maximize margin.", accent: "16,185,129" },
];

function AgentsContent({ light }: { light: boolean }) {
  return (
    <div className="relative max-w-5xl mx-auto px-6 pb-24" style={{ zIndex: 10 }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-center pt-16 pb-16"
      >
        <div
          className="inline-flex w-14 h-14 items-center justify-center rounded-2xl mb-6"
          style={{ background: `rgba(${VIOLET},0.12)`, border: `1px solid rgba(${VIOLET},0.25)` }}
        >
          <Bot className="w-7 h-7" style={{ color: "#8B5CF6" }} />
        </div>
        <h1 className={`text-5xl font-bold tracking-tighter mb-4 ${light ? "text-gray-900" : "text-white"}`}>
          AI Agents
        </h1>
        <p className={`text-base max-w-md mx-auto leading-relaxed ${light ? "text-gray-500" : "text-white/40"}`}>
          Six specialized agents running 24/7, handling every growth lever in your business so you can focus on what matters.
        </p>
        <span
          className="inline-flex items-center gap-1.5 mt-5 text-[11px] font-medium tracking-widest uppercase rounded-full px-4 py-1.5"
          style={{ background: `rgba(${VIOLET},0.1)`, border: `1px solid rgba(${VIOLET},0.2)`, color: "#8B5CF6" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Coming soon
        </span>
      </motion.div>

      {/* Agent grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
          hidden: {},
        }}
      >
        {AGENTS.map((agent) => (
          <motion.div
            key={agent.label}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.97 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.35, duration: 0.65 } },
            }}
            className={`rounded-2xl p-6 ${light ? "border border-black/[0.07] bg-black/[0.025]" : "border border-white/[0.06] bg-white/[0.02]"}`}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `rgba(${agent.accent},0.1)`, border: `1px solid rgba(${agent.accent},0.2)` }}
            >
              <agent.Icon className="w-4 h-4" style={{ color: `rgb(${agent.accent})` }} />
            </div>
            <h3 className={`font-semibold mb-2 tracking-tight ${light ? "text-gray-900" : "text-white/88"}`}>{agent.label}</h3>
            <p className={`text-sm leading-relaxed ${light ? "text-gray-500" : "text-white/35"}`}>{agent.desc}</p>
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
      <p className={`text-sm ${light ? "text-gray-500" : "text-white/40"}`}>Sign in to access AI Agents.</p>
    </div>
  );
}

function AgentsPage() {
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
          top: -200, left: -150, filter: "blur(40px)",
        }}
      />

      <SiteNav light={light} onToggle={toggle} />

      {isLoading ? null : isAuthenticated ? (
        <AgentsContent light={light} />
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
