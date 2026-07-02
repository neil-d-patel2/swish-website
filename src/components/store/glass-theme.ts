import type { CSSProperties } from "react";

// Shared palette for the /store dashboard's glass-card redesign (from the
// Claude Design mock "Store Dashboard.dc.html"). This page is intentionally
// fixed-light (no dark mode) — same as SignInHero.tsx — so these are literal
// values, not --mk-* theme variables.
export const glass = {
  frameBg:
    "radial-gradient(120% 80% at 90% 0%, rgba(10,102,255,.09), transparent 52%), linear-gradient(140deg, #edeef1, #fbfbfc)",
  ink: "#0b0b0c",
  muted: "#71717a",
  faint: "#a1a1aa",
  accent: "#0A66FF",
  accentTint: "rgba(10,102,255,.1)",
  danger: "#ba1a1a",
  dangerTint: "rgba(186,26,26,.1)",
  warn: "#9a6700",
  warnTint: "rgba(154,103,0,.12)",
  good: "#15803d",
  goodTint: "rgba(22,163,74,.1)",
  border: "rgba(0,0,0,.06)",
} as const;

export const glassCardStyle: CSSProperties = {
  background: "rgba(255,255,255,.62)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow:
    "inset 0 0 0 1px rgba(255,255,255,.6), 0 12px 40px -26px rgba(0,0,0,.35)",
  borderRadius: 18,
};

export const glassCardSStyle: CSSProperties = {
  background: "rgba(255,255,255,.5)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,.55)",
  borderRadius: 14,
};

export const pillBtnClass =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium cursor-pointer transition-transform active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

export const inkBtnStyle: CSSProperties = {
  background: glass.ink,
  color: "#fff",
  boxShadow: "0 8px 20px -10px rgba(0,0,0,.5)",
};

export const outlineBtnStyle: CSSProperties = {
  background: "rgba(255,255,255,.7)",
  color: glass.ink,
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)",
};

export const fieldStyle: CSSProperties = {
  background: "rgba(255,255,255,.6)",
  color: glass.ink,
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,.07)",
};
