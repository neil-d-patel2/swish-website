import { useRef, useState, useCallback, useEffect, useMemo, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import { useSpring, useSprings, animated, to } from "@react-spring/web";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useNavigate } from "@tanstack/react-router";
import {
  Github,
  ArrowRight,
  ShoppingBag,
  BarChart3,
  Bot,
  Sparkles,
  TrendingUp,
  Sun,
  Moon,
} from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";
import { useTheme } from "@/hooks/use-theme";

// ─── Tokens ───────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VIOLET = "139,92,246";
const BLUE = "59,130,246";
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$&";

// ─── Theme ────────────────────────────────────────────────────────────────────

const ThemeCtx = createContext(false); // false = dark, true = light
const useLightMode = () => useContext(ThemeCtx);

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS = ["Platform", "Agents", "Analytics", "Pricing"] as const;

const FEATURES = [
  {
    Icon: ShoppingBag,
    accentRgb: VIOLET,
    accentHex: "#8B5CF6",
    title: "AI Store Builder",
    desc: "Deploy a beautiful, high-converting store in minutes. No developers, no designers needed.",
  },
  {
    Icon: BarChart3,
    accentRgb: BLUE,
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
  { to: 10, suffix: "k+", label: "Stores launched" },
  { to: 3.2, suffix: "×", label: "Revenue growth", decimals: 1 },
  { static: "24/7", label: "Agent uptime" },
] as const;

const BARS = [28, 36, 22, 46, 32, 42, 56];

// Stable particle initial positions generated once
const N_PARTICLES = 20;
const N_TRAIL = 10;

type ParticleData = { x: number; y: number; size: number; opacity: number; accentRgb: string };

function makeParticles(): ParticleData[] {
  const w = typeof window !== "undefined" ? window.innerWidth : 1440;
  const h = typeof window !== "undefined" ? window.innerHeight : 900;
  return Array.from({ length: N_PARTICLES }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: 6 + Math.random() * 10,
    opacity: 0.08 + Math.random() * 0.18,
    accentRgb: Math.random() > 0.35 ? VIOLET : BLUE,
  }));
}

// ─── 1. CursorSpotlight — React Spring chasing radial glow ───────────────────

function CursorSpotlight() {
  const [{ x, y }, api] = useSpring(() => ({
    x: -400,
    y: -400,
    config: { tension: 85, friction: 28, mass: 1.2 },
  }));

  useEffect(() => {
    const onMove = (e: MouseEvent) => api.start({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [api]);

  return (
    <animated.div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 2,
        background: to(
          [x, y],
          (cx, cy) =>
            `radial-gradient(700px circle at ${cx}px ${cy}px, rgba(${VIOLET},0.055) 0%, transparent 65%)`,
        ),
      }}
    />
  );
}

// ─── 2. FloatingParticles — React Spring useSprings with drift + repulsion ────

function FloatingParticles() {
  const configs = useRef<ParticleData[]>(makeParticles());
  const basePos = useRef(configs.current.map((p) => ({ x: p.x, y: p.y })));

  const [springs, api] = useSprings(N_PARTICLES, (i) => ({
    x: configs.current[i].x,
    y: configs.current[i].y,
    config: { mass: 2 + Math.random() * 2, tension: 12 + Math.random() * 8, friction: 9 },
  }));

  useEffect(() => {
    const drift = () => {
      const w = window.innerWidth, h = window.innerHeight;
      api.start((i) => {
        const b = basePos.current[i];
        const nx = Math.max(20, Math.min(w - 20, b.x + (Math.random() - 0.5) * 160));
        const ny = Math.max(20, Math.min(h - 20, b.y + (Math.random() - 0.5) * 100));
        basePos.current[i] = { x: nx, y: ny };
        return { x: nx, y: ny, config: { tension: 8 + Math.random() * 6, friction: 7, mass: 3 } };
      });
    };
    drift();
    const id = setInterval(drift, 4000);
    return () => clearInterval(id);
  }, [api]);

  useEffect(() => {
    const RADIUS = 160;
    const onMove = (e: MouseEvent) => {
      api.start((i) => {
        const cx = springs[i].x.get(), cy = springs[i].y.get();
        const dx = cx - e.clientX, dy = cy - e.clientY;
        const dist = Math.hypot(dx, dy);
        if (dist < RADIUS && dist > 0) {
          const f = ((RADIUS - dist) / RADIUS) * 90;
          return { x: cx + (dx / dist) * f, y: cy + (dy / dist) * f, config: { tension: 380, friction: 16, mass: 0.6 } };
        }
        return {};
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [api, springs]);

  return (
    <>
      {springs.map((s, i) => {
        const cfg = configs.current[i];
        return (
          <animated.div
            key={i}
            className="fixed pointer-events-none"
            style={{
              zIndex: 1,
              x: s.x, y: s.y,
              width: cfg.size, height: cfg.size,
              marginLeft: -cfg.size / 2, marginTop: -cfg.size / 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${cfg.accentRgb},${cfg.opacity}) 0%, transparent 70%)`,
              willChange: "transform",
            }}
          />
        );
      })}
    </>
  );
}

// ─── 3. CursorTrail — React Spring useSprings with staggered tension ──────────

function CursorTrail() {
  const [springs, api] = useSprings(N_TRAIL, (i) => ({
    x: -100,
    y: -100,
    opacity: 0,
    config: {
      tension: 380 - i * 32,  // head: 380 → tail: ~92
      friction: 22 - i * 1.2, // head: 22  → tail: ~11
      mass: 0.4 + i * 0.15,   // head: 0.4 → tail: ~1.75
    },
  }));

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      api.start({ x: e.clientX, y: e.clientY, opacity: 1 });
    };
    const onLeave = () => api.start({ opacity: 0 });
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [api]);

  return (
    <>
      {springs.map((s, i) => {
        const size = Math.max(2, 7 - i * 0.5);
        return (
          <animated.div
            key={i}
            className="fixed pointer-events-none rounded-full"
            style={{
              zIndex: 50,
              x: s.x, y: s.y,
              opacity: s.opacity.to((o) => o * (0.75 - i * 0.065)),
              width: size, height: size,
              marginLeft: -size / 2, marginTop: -size / 2,
              background: `rgba(${VIOLET}, ${0.9 - i * 0.06})`,
              boxShadow: i < 3 ? `0 0 ${8 - i * 2}px rgba(${VIOLET},0.5)` : "none",
              willChange: "transform",
            }}
          />
        );
      })}
    </>
  );
}

// ─── 4. ScrollProgress — React Spring inertia progress bar ───────────────────

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const [{ w }, api] = useSpring(() => ({
    w: 0,
    config: { tension: 55, friction: 20, mass: 0.6 },
  }));

  useEffect(() => {
    return scrollYProgress.on("change", (v) => api.start({ w: v * 100 }));
  }, [scrollYProgress, api]);

  return (
    <animated.div
      className="fixed top-0 left-0 h-[1.5px] pointer-events-none"
      style={{
        zIndex: 100,
        width: w.to((v) => `${v}%`),
        background: `linear-gradient(90deg, rgba(${VIOLET},1), rgba(${BLUE},1))`,
        boxShadow: `0 0 8px rgba(${VIOLET},0.6)`,
      }}
    />
  );
}

// ─── 5. BurstParticles — Framer Motion gravity burst (portaled) ───────────────

function BurstParticles({ x, y }: { x: number; y: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        angle: (i / 14) * Math.PI * 2,
        speed: 55 + Math.random() * 75,
        size: 3 + Math.random() * 4,
        isViolet: Math.random() > 0.35,
        duration: 0.65 + Math.random() * 0.45,
        gravity: 50 + Math.random() * 60,
      })),
    [],
  );

  return createPortal(
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none rounded-full"
          style={{
            left: x,
            top: y,
            width: p.size,
            height: p.size,
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            background: p.isViolet
              ? `rgba(${VIOLET},0.9)`
              : "rgba(255,255,255,0.85)",
            zIndex: 9999,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.speed,
            y: Math.sin(p.angle) * p.speed + p.gravity,
            opacity: 0,
            scale: 0.1,
          }}
          transition={{ duration: p.duration, ease: [0.2, 0, 0.8, 1] }}
        />
      ))}
    </>,
    document.body,
  );
}

// ─── 6. MagneticButton — React Spring magnetic + ripple + burst portal ────────

type RippleDot = { id: number; x: number; y: number };

function MagneticButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
}) {
  const light = useLightMode();
  const ref = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<RippleDot[]>([]);
  const [bursts, setBursts] = useState<RippleDot[]>([]);

  const [s, api] = useSpring(() => ({
    x: 0, y: 0, scale: 1, glow: 0,
    config: { tension: 400, friction: 22, mass: 0.8 },
  }));

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      api.start({
        x: (e.clientX - (left + width / 2)) * 0.38,
        y: (e.clientY - (top + height / 2)) * 0.38,
        scale: 1.06, glow: 1,
      });
    },
    [api],
  );

  const onLeave = useCallback(() => {
    api.start({ x: 0, y: 0, scale: 1, glow: 0 });
  }, [api]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const { left, top } = ref.current.getBoundingClientRect();
      const id = Date.now();
      // In-button ripple
      setRipples((p) => [...p, { id, x: e.clientX - left, y: e.clientY - top }]);
      setTimeout(() => setRipples((p) => p.filter((r) => r.id !== id)), 700);
      // Viewport-level gravity burst
      const burstId = id + 1;
      setBursts((p) => [...p, { id: burstId, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setBursts((p) => p.filter((r) => r.id !== burstId)), 1200);
      onClick?.();
    },
    [onClick],
  );

  const rippleColor = variant === "primary" ? "rgba(0,0,0,0.1)" : light ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)";

  const sharedStyle = {
    x: s.x, y: s.y, scale: s.scale,
    position: "relative" as const,
    overflow: "hidden" as const,
  };

  const inner = (
    <>
      {children}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute rounded-full pointer-events-none"
            style={{ left: r.x, top: r.y, background: rippleColor }}
            initial={{ width: 0, height: 0, x: "-50%", y: "-50%", opacity: 1 }}
            animate={{ width: 200, height: 200, opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </>
  );

  return (
    <>
      {variant === "ghost" ? (
        <animated.button
          ref={ref}
          style={sharedStyle}
          className={`flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors duration-200 ${light ? "text-gray-500 hover:text-gray-900" : "text-white/45 hover:text-white"}`}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          onClick={handleClick}
        >
          {inner}
        </animated.button>
      ) : (
        <animated.button
          ref={ref}
          style={{
            ...sharedStyle,
            boxShadow: s.glow.to(
              (g) => `0 0 ${g * 36}px rgba(${VIOLET},${g * 0.4}), 0 0 ${g * 70}px rgba(${VIOLET},${g * 0.16})`,
            ),
          }}
          className="flex items-center gap-2.5 bg-white text-black font-semibold text-sm px-5 py-3 rounded-xl cursor-pointer"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          onClick={handleClick}
        >
          {inner}
        </animated.button>
      )}

      {/* Gravity burst particles portaled to body */}
      {bursts.map((b) => (
        <BurstParticles key={b.id} x={b.x} y={b.y} />
      ))}
    </>
  );
}

// ─── 7. WordReveal — Framer Motion per-word blur + stagger ───────────────────

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
              opacity: 1, y: 0, filter: "blur(0px)",
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

// ─── 8. ScrambleText — character scramble on hover ───────────────────────────

function ScrambleText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scramble = useCallback(() => {
    let iteration = 0;
    clearInterval(intervalRef.current!);
    intervalRef.current = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < Math.floor(iteration)) return text[i];
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join(""),
      );
      iteration += 0.55;
      if (iteration >= text.length) {
        clearInterval(intervalRef.current!);
        setDisplay(text);
      }
    }, 28);
  }, [text]);

  useEffect(() => () => clearInterval(intervalRef.current!), []);

  return (
    <span className={`cursor-default select-none ${className}`} onMouseEnter={scramble}>
      {display}
    </span>
  );
}

// ─── 9. TiltCard — React Spring 3D perspective tilt ─────────────────────────

function TiltCard({
  children,
  accentRgb,
}: {
  children: React.ReactNode;
  accentRgb: string;
}) {
  const light = useLightMode();
  const [s, api] = useSpring(() => ({
    rx: 0, ry: 0, scale: 1, glow: 0,
    config: { mass: 1, tension: 300, friction: 36 },
  }));

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
      api.start({
        rx: -((e.clientY - top) / height - 0.5) * 14,
        ry: ((e.clientX - left) / width - 0.5) * 14,
        scale: 1.025, glow: 1,
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
            light
              ? `0 0 0 1px rgba(0,0,0,${g * 0.08}), 0 24px 60px rgba(${accentRgb},${g * 0.11})`
              : `0 0 0 1px rgba(255,255,255,${g * 0.09}), 0 24px 60px rgba(${accentRgb},${g * 0.11})`,
        ),
        background: light ? "rgba(0,0,0,0.025)" : "rgba(255,255,255,0.02)",
        transformStyle: "preserve-3d" as "preserve-3d",
      }}
      className={`rounded-2xl p-6 cursor-default h-full ${light ? "border border-black/[0.08]" : "border border-white/[0.06]"}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </animated.div>
  );
}

// ─── 10. SpringStat — React Spring counted number on scroll entry ─────────────

function SpringStat({
  stat,
  inView,
}: {
  stat: (typeof STATS)[number];
  inView: boolean;
}) {
  const [{ n }, api] = useSpring(() => ({
    n: 0,
    config: { tension: 70, friction: 12, mass: 1.4 },
  }));

  useEffect(() => {
    if (inView && "to" in stat) api.start({ n: stat.to });
  }, [inView, stat, api]);

  if ("static" in stat) return <span>{stat.static}</span>;

  const { suffix, decimals } = stat as { to: number; suffix: string; decimals?: number };
  return (
    <animated.span>
      {n.to((v) => (decimals ? v.toFixed(decimals) : Math.floor(v).toString()) + suffix)}
    </animated.span>
  );
}

// ─── 11. MorphingBlob — Framer Motion CSS border-radius morphing ──────────────

function MorphingBlob() {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: 640,
        height: 520,
        background: `radial-gradient(ellipse, rgba(${VIOLET},0.045) 0%, transparent 70%)`,
        filter: "blur(50px)",
        left: "50%",
        top: "50%",
        x: "-50%",
        y: "-50%",
      }}
      animate={{
        borderRadius: [
          "60% 40% 70% 30% / 50% 60% 40% 50%",
          "30% 70% 40% 60% / 60% 40% 70% 30%",
          "50% 50% 30% 70% / 40% 70% 30% 60%",
          "60% 40% 70% 30% / 50% 60% 40% 50%",
        ],
        scale: [1, 1.08, 0.97, 1],
        rotate: [0, 6, -4, 0],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ─── 12. ProductMockup ────────────────────────────────────────────────────────

function ProductMockup() {
  return (
    <div
      className="rounded-2xl border border-white/[0.07] overflow-hidden w-full"
      style={{ background: "rgba(8,8,16,0.85)" }}
    >
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.05]">
        <div className="w-2.5 h-2.5 rounded-full bg-white/[0.07]" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/[0.07]" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/[0.07]" />
        <span className="ml-3 text-[11px] text-white/20 font-mono tracking-tight">
          swish — store dashboard
        </span>
      </div>

      <div className="p-5 grid grid-cols-3 gap-3">
        <div
          className="col-span-2 rounded-xl border border-white/[0.05] p-4"
          style={{ background: "rgba(255,255,255,0.018)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-white/25">Revenue</span>
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
                  height: h, originY: 1,
                  background: i === BARS.length - 1 ? "rgba(139,92,246,0.75)" : "rgba(255,255,255,0.07)",
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.85 + i * 0.07, duration: 0.5, ease: EASE }}
              />
            ))}
          </div>
        </div>

        <div
          className="rounded-xl border border-white/[0.05] p-4"
          style={{ background: "rgba(255,255,255,0.018)" }}
        >
          <span className="text-[10px] uppercase tracking-widest text-white/25 mb-3 block">Agents</span>
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
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.9 }}
                />
                <span className="text-xs text-white/40">{name} Agent</span>
              </motion.div>
            ))}
          </div>
        </div>

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
              Restock "Wireless Earbuds Pro" — trending +40% regionally, low stock detected. Est. opportunity: $3,200.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── 13. HowItWorksSection ────────────────────────────────────────────────────

function HowItWorksSection() {
  const light = useLightMode();
  const [active, setActive] = useState("build");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const current = HOW_IT_WORKS.find((h) => h.id === active)!;

  return (
    <section ref={ref} className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ type: "spring", bounce: 0.35, duration: 0.75 }}
      >
        <div className="flex justify-center mb-12">
          <div className={`flex items-center gap-1 rounded-full p-1.5 ${light ? "border border-black/[0.08] bg-black/[0.03]" : "border border-white/[0.07] bg-white/[0.03]"}`}>
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
                      background: "linear-gradient(135deg, rgba(139,92,246,0.22), rgba(59,130,246,0.22))",
                      border: "1px solid rgba(139,92,246,0.28)",
                    }}
                    transition={{ type: "spring", bounce: 0.18, duration: 0.4 }}
                  />
                )}
                <span className={`relative z-10 transition-colors duration-200 ${active === item.id ? (light ? "text-gray-900" : "text-white") : (light ? "text-gray-400" : "text-white/35")}`}>
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
            <h3 className={`text-3xl font-bold tracking-tight mb-3 ${light ? "text-gray-900" : ""}`}>{current.heading}</h3>
            <p className={`leading-relaxed ${light ? "text-gray-500" : "text-white/40"}`}>{current.body}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

// ─── 14. LandingPage ─────────────────────────────────────────────────────────

const NAV_ROUTES: Record<string, string> = {
  Platform: "/",
  Agents: "/agents",
  Analytics: "/analytics",
  Pricing: "/pricing",
};

export function LandingPage() {
  const { signIn, signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const { light: lightMode, toggle: toggleTheme } = useTheme();
  const [navHovered, setNavHovered] = useState<string | null>(null);
  const navActive = "Platform";

  const visibleNavItems = isAuthenticated
    ? (NAV_ITEMS as readonly string[])
    : ["Platform"];

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroTextY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const mockupY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });

  return (
    <ThemeCtx.Provider value={lightMode}>
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${lightMode ? "text-gray-900" : "text-white"}`}
      style={{ background: lightMode ? "#f8f9fc" : "#050508" }}
    >

      {/* Physics layers (fixed/global) */}
      <ScrollProgress />
      <CursorSpotlight />
      <CursorTrail />
      <FloatingParticles />

      {/* Subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundImage: lightMode
            ? `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`
            : `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />

      {/* Ambient orbs */}
      <motion.div
        className="fixed pointer-events-none rounded-full"
        style={{
          zIndex: 0, width: 720, height: 720,
          background: `radial-gradient(circle, rgba(${VIOLET},0.09) 0%, transparent 65%)`,
          top: -280, left: -220, filter: "blur(40px)",
        }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed pointer-events-none rounded-full"
        style={{
          zIndex: 0, width: 520, height: 520,
          background: `radial-gradient(circle, rgba(${BLUE},0.07) 0%, transparent 65%)`,
          bottom: -160, right: -160, filter: "blur(40px)",
        }}
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Nav — layoutId nav-pill */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex items-center justify-between max-w-5xl mx-auto px-6 py-6"
        style={{ zIndex: 20 }}
      >
        <span className="text-lg font-bold tracking-tight">Swish</span>

        <div className={`hidden md:flex items-center gap-0.5 rounded-full px-1.5 py-1.5 ${lightMode ? "border border-black/[0.08] bg-black/[0.03]" : "border border-white/[0.07] bg-white/[0.025]"}`}>
          {visibleNavItems.map((item) => (
            <button
              key={item}
              className="relative px-4 py-1.5 text-sm rounded-full cursor-pointer"
              onMouseEnter={() => setNavHovered(item)}
              onMouseLeave={() => setNavHovered(null)}
              onClick={() => isAuthenticated && void navigate({ to: NAV_ROUTES[item] as "/" })}
            >
              {(navHovered === item || (!navHovered && navActive === item)) && (
                <motion.div
                  layoutId="nav-pill"
                  className={`absolute inset-0 rounded-full ${lightMode ? "bg-black/[0.06]" : "bg-white/[0.08]"}`}
                  transition={{ type: "spring", bounce: 0.18, duration: 0.32 }}
                />
              )}
              <span className={`relative z-10 transition-colors duration-150 ${navActive === item && !navHovered ? (lightMode ? "text-gray-800" : "text-white/80") : (lightMode ? "text-gray-400" : "text-white/38")}`}>
                {item}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer ${lightMode ? "text-gray-500 hover:text-gray-900 hover:bg-black/[0.06]" : "text-white/45 hover:text-white hover:bg-white/[0.08]"}`}
            aria-label="Toggle light mode"
          >
            {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          {isAuthenticated ? (
            <MagneticButton variant="ghost" onClick={() => void signOut()}>
              Sign out
            </MagneticButton>
          ) : (
            <MagneticButton variant="ghost" onClick={() => void signIn("github")}>
              <Github className="w-4 h-4" /> Sign in
            </MagneticButton>
          )}
        </div>
      </motion.nav>

      {/* Hero — scroll parallax + morphing blob */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center text-center px-6 pt-14 pb-24 overflow-hidden"
        style={{ zIndex: 10 }}
      >
        {/* Morphing blob behind hero content */}
        <MorphingBlob />

        {/* Parallax text layer */}
        <motion.div
          style={{ y: heroTextY, opacity: heroTextOpacity }}
          className="relative flex flex-col items-center z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-7"
          >
            <span className={`inline-flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase rounded-full px-4 py-1.5 ${lightMode ? "text-gray-400 border border-black/[0.08]" : "text-white/30 border border-white/[0.07]"}`}>
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Multi-Agent AI · Now in beta
            </span>
          </motion.div>

          {/* H1 — WordReveal entry + ScrambleText hover */}
          <h1 className="text-[clamp(44px,8vw,90px)] font-bold tracking-tighter leading-[0.93] max-w-3xl mb-5">
            <WordReveal text="Enterprise power." className="justify-center" delay={0.22} />
            <br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.48, duration: 0.4 }}
              className="bg-gradient-to-br from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent"
            >
              <ScrambleText text="Small business soul." />
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.88, ease: EASE }}
            className={`text-base max-w-sm leading-relaxed mb-8 ${lightMode ? "text-gray-500" : "text-white/40"}`}
          >
            Swish deploys AI agents that build your store, analyze your data, and surface
            actions that drive real growth.
          </motion.p>

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
              See how it works <ArrowRight className="w-3.5 h-3.5 opacity-40" />
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Parallax mockup layer — deeper layer, bobbing + draggable */}
        <motion.div
          style={{ y: mockupY }}
          initial={{ opacity: 0, y: 52 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.72, ease: EASE }}
          className="relative mt-20 w-full max-w-3xl z-10"
        >
          {/* Continuous bob */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Draggable with elastic spring snap-back */}
            <motion.div
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.12}
              dragMomentum={false}
              dragTransition={{ bounceStiffness: 420, bounceDamping: 38 }}
              whileDrag={{ scale: 1.015, rotateZ: 1.5, cursor: "grabbing" }}
              className="cursor-grab"
            >
              <ProductMockup />
            </motion.div>
          </motion.div>

          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-2/3 h-20 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse, rgba(${VIOLET},0.22) 0%, transparent 70%)`,
              filter: "blur(20px)",
            }}
          />
        </motion.div>
      </section>

      {/* Stats — spring-counted numbers */}
      <section ref={statsRef} className="relative max-w-5xl mx-auto px-6 pb-24" style={{ zIndex: 10 }}>
        <motion.div
          className={`grid grid-cols-3 rounded-2xl ${lightMode ? "divide-x divide-black/[0.08] border border-black/[0.08]" : "divide-x divide-white/[0.05] border border-white/[0.05]"}`}
          style={{ background: lightMode ? "rgba(0,0,0,0.025)" : "rgba(255,255,255,0.015)" }}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
          variants={{
            visible: { transition: { staggerChildren: 0.14 } },
            hidden: {},
          }}
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: {
                  opacity: 1, y: 0, scale: 1,
                  transition: { type: "spring", bounce: 0.42, duration: 0.75 },
                },
              }}
              className="text-center py-9"
            >
              <p className="text-3xl font-bold tracking-tight mb-1.5">
                <SpringStat stat={stat} inView={statsInView} />
              </p>
              <p className={`text-[11px] uppercase tracking-widest ${lightMode ? "text-gray-400" : "text-white/28"}`}>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features — 3D TiltCards */}
      <section ref={featuresRef} className="relative max-w-5xl mx-auto px-6 pb-28" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          transition={{ type: "spring", bounce: 0.3, duration: 0.7 }}
          className="text-center mb-10"
        >
          <p className={`text-[10px] uppercase tracking-widest mb-3 ${lightMode ? "text-gray-400" : "text-white/22"}`}>What Swish does</p>
          <h2 className={`text-3xl font-bold tracking-tight ${lightMode ? "text-gray-900" : ""}`}>Everything your business needs.</h2>
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
                hidden: { opacity: 0, y: 24, scale: 0.96 },
                visible: {
                  opacity: 1, y: 0, scale: 1,
                  transition: { type: "spring", bounce: 0.38, duration: 0.7 },
                },
              }}
            >
              <TiltCard accentRgb={f.accentRgb}>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `rgba(${f.accentRgb},0.1)`, border: `1px solid rgba(${f.accentRgb},0.2)` }}
                >
                  <f.Icon className="w-4 h-4" style={{ color: f.accentHex }} />
                </div>
                <h3 className={`font-semibold mb-2 tracking-tight ${lightMode ? "text-gray-900" : "text-white/88"}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${lightMode ? "text-gray-500" : "text-white/35"}`}>{f.desc}</p>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works — layoutId tabs */}
      <HowItWorksSection />

      {/* Footer CTA */}
      <section className="relative max-w-5xl mx-auto px-6 pb-28 text-center" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", bounce: 0.35, duration: 0.75 }}
          className={`rounded-3xl p-12 ${lightMode ? "border border-black/[0.08]" : "border border-white/[0.06]"}`}
          style={{ background: lightMode ? "rgba(0,0,0,0.025)" : "rgba(255,255,255,0.018)" }}
        >
          <p className={`text-3xl font-bold tracking-tight mb-3 ${lightMode ? "text-gray-900" : ""}`}>
            Ready to level the playing field?
          </p>
          <p className={`text-sm mb-8 max-w-xs mx-auto ${lightMode ? "text-gray-500" : "text-white/38"}`}>
            Be the first to know when we launch. Join the waitlist and get early access.
          </p>
          <WaitlistForm />
        </motion.div>
      </section>

      <footer className={`relative text-center py-8 text-xs ${lightMode ? "text-gray-400 border-t border-black/[0.06]" : "text-white/15 border-t border-white/[0.04]"}`} style={{ zIndex: 10 }}>
        © 2025 Swish · Built with AI
      </footer>
    </div>
    </ThemeCtx.Provider>
  );
}
