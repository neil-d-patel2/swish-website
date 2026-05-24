import { createFileRoute } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, ShoppingBag, Zap, Lock } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

const VIOLET = "139,92,246";
const BLUE = "59,130,246";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const METRICS = [
  { label: "Total Revenue", value: "$—", change: "+—%", Icon: TrendingUp, accent: VIOLET },
  { label: "Active Customers", value: "—", change: "+—%", Icon: Users, accent: BLUE },
  { label: "Orders Today", value: "—", change: "—%", Icon: ShoppingBag, accent: "16,185,129" },
  { label: "Conversion Rate", value: "—%", change: "+—%", Icon: Zap, accent: VIOLET },
];

const INSIGHTS = [
  { title: "Top Products", desc: "See which products drive the most revenue and have the highest margin." },
  { title: "Customer Segments", desc: "Understand who your best customers are and what keeps them coming back." },
  { title: "Campaign Performance", desc: "Track ROI across every channel — ads, email, SEO — in one place." },
  { title: "Inventory Health", desc: "Spot slow-moving stock and upcoming stockouts before they hit your bottom line." },
];

function AnalyticsContent({ light }: { light: boolean }) {
  const card = light ? "border border-black/[0.07] bg-black/[0.025]" : "border border-white/[0.06] bg-white/[0.02]";

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
          style={{ background: `rgba(${BLUE},0.12)`, border: `1px solid rgba(${BLUE},0.25)` }}
        >
          <BarChart3 className="w-7 h-7" style={{ color: "#3B82F6" }} />
        </div>
        <h1 className={`text-5xl font-bold tracking-tighter mb-4 ${light ? "text-gray-900" : "text-white"}`}>
          Analytics
        </h1>
        <p className={`text-base max-w-md mx-auto leading-relaxed ${light ? "text-gray-500" : "text-white/40"}`}>
          Stop drowning in dashboards. Get clear, prioritized actions and plain-English insights that actually move the needle.
        </p>
        <span
          className="inline-flex items-center gap-1.5 mt-5 text-[11px] font-medium tracking-widest uppercase rounded-full px-4 py-1.5"
          style={{ background: `rgba(${BLUE},0.1)`, border: `1px solid rgba(${BLUE},0.2)`, color: "#3B82F6" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Coming soon
        </span>
      </motion.div>

      {/* Metric cards */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
          hidden: {},
        }}
      >
        {METRICS.map((m) => (
          <motion.div
            key={m.label}
            variants={{
              hidden: { opacity: 0, y: 16, scale: 0.97 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.35, duration: 0.6 } },
            }}
            className={`rounded-2xl p-5 ${card}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] uppercase tracking-widest ${light ? "text-gray-400" : "text-white/28"}`}>{m.label}</span>
              <m.Icon className="w-3.5 h-3.5" style={{ color: `rgb(${m.accent})` }} />
            </div>
            <p className={`text-2xl font-bold tracking-tight mb-1 ${light ? "text-gray-900" : "text-white"}`}>{m.value}</p>
            <p className={`text-xs ${light ? "text-gray-400" : "text-white/28"}`}>{m.change}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Insight cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
          hidden: {},
        }}
      >
        {INSIGHTS.map((ins) => (
          <motion.div
            key={ins.title}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3, duration: 0.6 } },
            }}
            className={`rounded-2xl p-6 ${card}`}
          >
            <h3 className={`font-semibold mb-2 tracking-tight ${light ? "text-gray-900" : "text-white/88"}`}>{ins.title}</h3>
            <p className={`text-sm leading-relaxed ${light ? "text-gray-500" : "text-white/35"}`}>{ins.desc}</p>
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
        style={{ background: `rgba(${BLUE},0.1)`, border: `1px solid rgba(${BLUE},0.2)` }}
      >
        <Lock className="w-6 h-6" style={{ color: "#3B82F6" }} />
      </div>
      <h2 className={`text-2xl font-bold tracking-tight mb-2 ${light ? "text-gray-900" : "text-white"}`}>Sign in required</h2>
      <p className={`text-sm ${light ? "text-gray-500" : "text-white/40"}`}>Sign in to access Analytics.</p>
    </div>
  );
}

function AnalyticsPage() {
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
          background: `radial-gradient(circle, rgba(${BLUE},0.07) 0%, transparent 65%)`,
          top: -200, right: -150, filter: "blur(40px)",
        }}
      />

      <SiteNav light={light} onToggle={toggle} />

      {isLoading ? null : isAuthenticated ? (
        <AnalyticsContent light={light} />
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
