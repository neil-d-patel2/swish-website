import { useRef, useState, useCallback, useEffect, useMemo, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useSpring, useSprings, animated, to } from "@react-spring/web";

// ─── Tokens ───────────────────────────────────────────────────────────────────

export const VIOLET = "139,92,246";
export const BLUE = "59,130,246";
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ─── Theme ────────────────────────────────────────────────────────────────────

export const ThemeCtx = createContext(false); // false = dark, true = light
export const useLightMode = () => useContext(ThemeCtx);

// ─── Particle helpers ─────────────────────────────────────────────────────────

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

// ─── CursorSpotlight — React Spring chasing radial glow ──────────────────────

export function CursorSpotlight() {
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

// ─── FloatingParticles — React Spring useSprings with drift + repulsion ───────

export function FloatingParticles() {
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

// ─── CursorTrail — React Spring useSprings with staggered tension ─────────────

export function CursorTrail() {
  const [springs, api] = useSprings(N_TRAIL, (i) => ({
    x: -100,
    y: -100,
    opacity: 0,
    config: {
      tension: 380 - i * 32,
      friction: 22 - i * 1.2,
      mass: 0.4 + i * 0.15,
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

// ─── ScrollProgress — React Spring inertia progress bar ──────────────────────

export function ScrollProgress() {
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

// ─── BurstParticles — Framer Motion gravity burst (portaled) ──────────────────

export function BurstParticles({ x, y }: { x: number; y: number }) {
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

// ─── MagneticButton — React Spring magnetic + ripple + burst portal ───────────

type RippleDot = { id: number; x: number; y: number };

export function MagneticButton({
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
      setRipples((p) => [...p, { id, x: e.clientX - left, y: e.clientY - top }]);
      setTimeout(() => setRipples((p) => p.filter((r) => r.id !== id)), 700);
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
      {bursts.map((b) => (
        <BurstParticles key={b.id} x={b.x} y={b.y} />
      ))}
    </>
  );
}

// ─── TiltCard — React Spring 3D perspective tilt ──────────────────────────────

export function TiltCard({
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

// ─── MorphingBlob — Framer Motion CSS border-radius morphing ──────────────────

export function MorphingBlob() {
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
