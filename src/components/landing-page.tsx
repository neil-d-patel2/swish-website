import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useSpring, animated, to } from "@react-spring/web";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Github,
  ArrowRight,
  ShoppingBag,
  BarChart3,
  Bot,
  Sparkles,
  TrendingUp,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ─── Static data ──────────────────────────────────────────────────────────────

const NAV_ITEMS = ["Platform", "Agents", "Analytics", "Pricing"] as const;

const FEATURES = [
  {
    Icon: ShoppingBag,
    accentRgb: "139,92,246",
    accentHex: "#8B5CF6",
    title: "AI Store Builder",
    desc: "Deploy a beautiful, high-converting store in minutes. No developers, no designers needed.",
  },
  {
    Icon: BarChart3,
    accentRgb: "59,130,246",
    accentHex: "#3B82F6",
    title: "Actionable Analytics",
    desc: "Stop drowning in dashboards. Get clear, prioritized actions that actually move the needle.",
  },
  {
    Icon: Bot,
    accentRgb: "16,185,129",
    accentHex: "#10B981",
    title: "Autonomous Agents",
    desc: "24/7 AI specialists handling SEO, inventory, ads, and email while you run your business.",
  },
];

const HOW_IT_WORKS = [
  {
    id: "build",
    label: "Build",
    heading: "Launch in minutes, not months.",
    body: "Describe your business and Swish deploys a fully optimized store — complete with copy, product pages, and checkout — automatically.",
  },
  {
    id: "analyze",
    label: "Analyze",
    heading: "Data that tells you what to do.",
    body: "Instead of raw charts, you get plain-English recommendations. Know exactly which products to push, when to restock, and where customers drop off.",
  },
  {
    id: "grow",
    label: "Grow",
    heading: "Compete with the big players.",
    body: "Your agents run campaigns, optimize prices, and respond to market shifts around the clock. Enterprise-grade execution at a fraction of the cost.",
  },
];

const STATS = [
  { value: "10k+", label: "Stores launched" },
  { value: "3.2×", label: "Revenue growth" },
  { value: "24/7", label: "Agent uptime" },
];

const BARS = [28, 36, 22, 46, 32, 42, 56];

// ─── MagneticButton — React Spring physics ────────────────────────────────────

function MagneticButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [s, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    glow: 0,
    config: { tension: 400, friction: 22, mass: 0.8 },
  }));

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      api.start({
        x: (e.clientX - (left + width / 2)) * 0.38,
        y: (e.clientY - (top + height / 2)) * 0.38,
        scale: 1.06,
        glow: 1,
      });
    },
    [api],
  );

  const onLeave = useCallback(() => {
    api.start({ x: 0, y: 0, scale: 1, glow: 0 });
  }, [api]);

  if (variant === "ghost") {
    return (
      <animated.button
        ref={ref}
        style={{ x: s.x, y: s.y, scale: s.scale }}
        className="flex items-center gap-2 text-sm text-white/45 hover:text-white font-medium cursor-pointer transition-colors duration-200"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={onClick}
      >
        {children}
      </animated.button>
    );
  }

  return (
    <animated.button
      ref={ref}
      style={{
        x: s.x,
        y: s.y,
        scale: s.scale,
        boxShadow: s.glow.to(
          (g) =>
            `0 0 ${g * 36}px rgba(139,92,246,${g * 0.4}), 0 0 ${g * 70}px rgba(139,92,246,${g * 0.16})`,
        ),
      }}
      className="flex items-center gap-2.5 bg-white text-black font-semibold text-sm px-5 py-3 rounded-xl cursor-pointer"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {children}
    </animated.button>
  );
}

// ─── WordReveal — Framer Motion stagger ───────────────────────────────────────

function WordReveal({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.span
      className={`flex flex-wrap gap-x-[0.26em] ${className}`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.075, delayChildren: delay } },
      }}
    >
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.65, ease: EASE },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ─── TiltCard — React Spring 3D parallax ─────────────────────────────────────

function TiltCard({
  children,
  accentRgb,
}: {
  children: React.ReactNode;
  accentRgb: string;
}) {
  const [s, api] = useSpring(() => ({
    rx: 0,
    ry: 0,
    scale: 1,
    glow: 0,
    config: { mass: 1, tension: 300, friction: 36 },
  }));

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
      api.start({
        rx: -((e.clientY - top) / height - 0.5) * 14,
        ry: ((e.clientX - left) / width - 0.5) * 14,
        scale: 1.025,
        glow: 1,
      });
    },
    [api],
  );

  const onLeave = useCallback(() => {
    api.start({ rx: 0, ry: 0, scale: 1, glow: 0 });
  }, [api]);

  return (
    <animated.div
      style={{
        transform: to(
          [s.rx, s.ry, s.scale],
          (rx, ry, sc) =>
            `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${sc})`,
        ),
        boxShadow: s.glow.to(
          (g) =>
            `0 0 0 1px rgba(255,255,255,${g * 0.09}), 0 24px 60px rgba(${accentRgb},${g * 0.11})`,
        ),
        background: "rgba(255,255,255,0.02)",
        transformStyle: "preserve-3d" as "preserve-3d",
      }}
      className="rounded-2xl border border-white/[0.06] p-6 cursor-default h-full"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </animated.div>
  );
}

// ─── Product mockup ───────────────────────────────────────────────────────────

function ProductMockup() {
  return (
    <div
      className="rounded-2xl border border-white/[0.07] overflow-hidden w-full"
      style={{ background: "rgba(8,8,16,0.85)" }}
    >
      {/* Chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.05]">
        <div className="w-2.5 h-2.5 rounded-full bg-white/[0.07]" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/[0.07]" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/[0.07]" />
        <span className="ml-3 text-[11px] text-white/20 font-mono tracking-tight">
          swish — store dashboard
        </span>
      </div>

      <div className="p-5 grid grid-cols-3 gap-3">
        {/* Revenue */}
        <div
          className="col-span-2 rounded-xl border border-white/[0.05] p-4"
          style={{ background: "rgba(255,255,255,0.018)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-white/25">
              Revenue
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +23.5%
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight mb-4">$12,450</p>
          <div className="flex items-end gap-1" style={{ height: 56 }}>
            {BARS.map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: h,
                  originY: 1,
                  background:
                    i === BARS.length - 1
                      ? "rgba(139,92,246,0.75)"
                      : "rgba(255,255,255,0.07)",
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.85 + i * 0.07, duration: 0.5, ease: EASE }}
              />
            ))}
          </div>
        </div>

        {/* Agents */}
        <div
          className="rounded-xl border border-white/[0.05] p-4"
          style={{ background: "rgba(255,255,255,0.018)" }}
        >
          <span className="text-[10px] uppercase tracking-widest text-white/25 mb-3 block">
            Agents
          </span>
          <div className="flex flex-col gap-2.5">
            {["SEO", "Ads", "Email"].map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.12, duration: 0.4, ease: EASE }}
                className="flex items-center gap-2"
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.9 }}
                />
                <span className="text-xs text-white/40">{name} Agent</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.5, ease: EASE }}
          className="col-span-3 rounded-xl border border-violet-500/20 p-3 flex items-start gap-3"
          style={{ background: "rgba(139,92,246,0.05)" }}
        >
          <div className="w-5 h-5 rounded flex items-center justify-center bg-violet-500/20 shrink-0 mt-0.5">
            <Sparkles className="w-3 h-3 text-violet-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-violet-300 mb-0.5">AI Insight</p>
            <p className="text-[11px] text-white/35 leading-relaxed">
              Restock "Wireless Earbuds Pro" — trending +40% regionally, low stock detected.
              Est. opportunity: $3,200.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── How It Works — Framer Motion layoutId tabs ───────────────────────────────

function HowItWorksSection() {
  const [active, setActive] = useState("build");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const current = HOW_IT_WORKS.find((h) => h.id === active)!;

  return (
    <section ref={ref} className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.03] p-1.5">
            {HOW_IT_WORKS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className="relative px-5 py-2 text-sm font-medium rounded-full cursor-pointer"
              >
                {active === item.id && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(139,92,246,0.22), rgba(59,130,246,0.22))",
                      border: "1px solid rgba(139,92,246,0.28)",
                    }}
                    transition={{ type: "spring", bounce: 0.18, duration: 0.4 }}
                  />
                )}
                <span
                  className={`relative z-10 transition-colors duration-200 ${
                    active === item.id ? "text-white" : "text-white/35"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="text-center max-w-xl mx-auto"
          >
            <h3 className="text-3xl font-bold tracking-tight mb-3">{current.heading}</h3>
            <p className="text-white/40 leading-relaxed">{current.body}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export function LandingPage() {
  const { signIn } = useAuthActions();
  const [navHovered, setNavHovered] = useState<string | null>(null);
  const navActive = "Platform";

  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: "#050508" }}
    >
      {/* Grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />

      {/* Ambient orbs */}
      <motion.div
        className="fixed pointer-events-none rounded-full"
        style={{
          width: 720,
          height: 720,
          background: "radial-gradient(circle, rgba(109,40,217,0.1) 0%, transparent 65%)",
          top: -280,
          left: -220,
          filter: "blur(40px)",
        }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed pointer-events-none rounded-full"
        style={{
          width: 520,
          height: 520,
          background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 65%)",
          bottom: -160,
          right: -160,
          filter: "blur(40px)",
        }}
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* ── Nav (layoutId pill) ── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 flex items-center justify-between max-w-5xl mx-auto px-6 py-6"
      >
        <span className="text-lg font-bold tracking-tight">Swish</span>

        <div className="hidden md:flex items-center gap-0.5 rounded-full border border-white/[0.07] bg-white/[0.025] px-1.5 py-1.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              className="relative px-4 py-1.5 text-sm rounded-full cursor-pointer"
              onMouseEnter={() => setNavHovered(item)}
              onMouseLeave={() => setNavHovered(null)}
            >
              {(navHovered === item || (!navHovered && navActive === item)) && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.08]"
                  transition={{ type: "spring", bounce: 0.18, duration: 0.32 }}
                />
              )}
              <span
                className={`relative z-10 transition-colors duration-150 ${
                  navActive === item && !navHovered ? "text-white/80" : "text-white/38"
                }`}
              >
                {item}
              </span>
            </button>
          ))}
        </div>

        <MagneticButton variant="ghost" onClick={() => void signIn("github")}>
          <Github className="w-4 h-4" />
          Sign in
        </MagneticButton>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-14 pb-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-7"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase text-white/30 border border-white/[0.07] rounded-full px-4 py-1.5">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Multi-Agent AI · Now in beta
          </span>
        </motion.div>

        {/* H1 — word-by-word blur reveal */}
        <h1 className="text-[clamp(44px,8vw,90px)] font-bold tracking-tighter leading-[0.93] max-w-3xl mb-5">
          <WordReveal text="Enterprise power." className="justify-center" delay={0.22} />
          <br />
          <WordReveal
            text="Small business soul."
            className="bg-gradient-to-br from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent justify-center"
            delay={0.48}
          />
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.88, ease: EASE }}
          className="text-base text-white/40 max-w-sm leading-relaxed mb-8"
        >
          Swish deploys AI agents that build your store, analyze your data, and surface
          actions that drive real growth.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.08, ease: EASE }}
          className="flex items-center gap-5"
        >
          <MagneticButton onClick={() => void signIn("github")}>
            <Github className="w-4 h-4" />
            Get started free
            <ArrowRight className="w-3.5 h-3.5 opacity-40" />
          </MagneticButton>
          <MagneticButton variant="ghost">
            See how it works
            <ArrowRight className="w-3.5 h-3.5 opacity-40" />
          </MagneticButton>
        </motion.div>

        {/* Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 52 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.72, ease: EASE }}
          className="relative mt-20 w-full max-w-3xl"
        >
          <ProductMockup />
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-2/3 h-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, rgba(109,40,217,0.22) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section ref={statsRef} className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          className="grid grid-cols-3 divide-x divide-white/[0.05] border border-white/[0.05] rounded-2xl"
          style={{ background: "rgba(255,255,255,0.015)" }}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
          variants={{
            visible: { transition: { staggerChildren: 0.12 } },
            hidden: {},
          }}
        >
          {STATS.map(({ value, label }) => (
            <motion.div
              key={label}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
              }}
              className="text-center py-9"
            >
              <p className="text-3xl font-bold tracking-tight mb-1.5">{value}</p>
              <p className="text-[11px] text-white/28 uppercase tracking-widest">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Features (3D TiltCards) ── */}
      <section ref={featuresRef} className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-10"
        >
          <p className="text-[10px] uppercase tracking-widest text-white/22 mb-3">
            What Swish does
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Everything your business needs.
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          variants={{
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
            hidden: {},
          }}
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
              }}
            >
              <TiltCard accentRgb={f.accentRgb}>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: `rgba(${f.accentRgb},0.1)`,
                    border: `1px solid rgba(${f.accentRgb},0.2)`,
                  }}
                >
                  <f.Icon className="w-4 h-4" style={{ color: f.accentHex }} />
                </div>
                <h3 className="font-semibold text-white/88 mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{f.desc}</p>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How it works (layoutId tabs + AnimatePresence) ── */}
      <HowItWorksSection />

      {/* ── Footer CTA ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="rounded-3xl border border-white/[0.06] p-12"
          style={{ background: "rgba(255,255,255,0.018)" }}
        >
          <p className="text-3xl font-bold tracking-tight mb-3">
            Ready to level the playing field?
          </p>
          <p className="text-white/38 text-sm mb-8 max-w-xs mx-auto">
            Join thousands of small businesses using Swish to compete — and win.
          </p>
          <div className="flex justify-center">
            <MagneticButton onClick={() => void signIn("github")}>
              <Github className="w-4 h-4" />
              Start for free
              <ArrowRight className="w-3.5 h-3.5 opacity-40" />
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 text-center py-8 text-xs text-white/15 border-t border-white/[0.04]">
        © 2025 Swish · Built with AI
      </footer>
    </div>
  );
}
