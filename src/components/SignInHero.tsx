import { useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const BLUE = "#0A66FF";
const INK = "#0b0b0c";
const mono: React.CSSProperties = {
  fontFamily: '"Consolas","Monaco",monospace',
  letterSpacing: ".16em",
  textTransform: "uppercase",
  fontSize: 11.5,
  color: "#a1a1aa",
};
const monoBlue: React.CSSProperties = { ...mono, color: BLUE };

type Billing = "monthly" | "annual";

const previewTiers = [
  { name: "Starter", tag: "Entry Level", monthly: 29, blurb: "Everything one store needs to start growing with AI.", cta: "Select Starter", dark: false, enterprise: false },
  { name: "Pro", tag: "Accelerator", monthly: 79, blurb: "For growing brands that want automation doing the heavy lifting.", cta: "Get started with Pro", dark: true, enterprise: false },
  { name: "Enterprise", tag: "Global Scale", monthly: null, blurb: "Tailored infrastructure, security, and support at any scale.", cta: "Contact sales", dark: false, enterprise: true },
];

const faqs = [
  { q: "Can I change plans later?", a: "Absolutely. Upgrade or downgrade anytime from your dashboard — changes are prorated automatically." },
  { q: "Is there a free trial?", a: "Every paid plan includes a 14-day free trial. No credit card required to start." },
  { q: "What counts as a connected store?", a: "Any storefront you link to Swish — Shopify, WooCommerce, or a custom integration. Each store syncs its own catalog and analytics." },
  { q: "How does annual billing work?", a: "Annual plans are billed once per year at a 20% discount versus paying monthly." },
  { q: "Can I cancel anytime?", a: "Yes. No long-term contracts on Starter or Pro — cancel in one click and keep access until end of billing period." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 0 0 1px rgba(0,0,0,.07)", overflow: "hidden" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 22px", textAlign: "left", background: "transparent", border: "none", cursor: "pointer" }}
      >
        <span style={{ fontSize: 15.5, fontWeight: 500, color: INK }}>{q}</span>
        <ChevronDown style={{ width: 18, height: 18, flexShrink: 0, color: "#71717a", transform: open ? "rotate(180deg)" : "none", transition: "transform .3s" }} />
      </button>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .3s ease-out" }}>
        <div style={{ overflow: "hidden" }}>
          <p style={{ padding: "0 22px 18px", fontSize: 14, lineHeight: 1.6, color: "#52525b", margin: 0 }}>{a}</p>
        </div>
      </div>
    </div>
  );
}

export function SignInHero() {
  const { session } = useSupabaseAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState<Billing>("monthly");

  const signInWithGoogle = () =>
    void supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

  const handleCTA = () => {
    if (session) void navigate({ to: "/dashboard" });
    else signInWithGoogle();
  };

  const handlePlanTierClick = (tierName: string) => {
    localStorage.setItem("swish_pending_plan", tierName.toLowerCase());
    if (session) {
      void navigate({ to: "/pricing" });
    } else {
      void supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/pricing` },
      });
    }
  };

  const priceLabel = (t: (typeof previewTiers)[number]) => {
    if (t.monthly === null) return "Custom";
    return billing === "annual" ? `$${Math.round(t.monthly * 0.8)}` : `$${t.monthly}`;
  };

  const priceSub = (t: (typeof previewTiers)[number]) => {
    if (t.monthly === null) return "";
    return billing === "annual" ? "/mo billed annually" : "/mo";
  };

  return (
    <div style={{ background: "#fff", color: INK, fontFamily: '"Geist Variable",-apple-system,BlinkMacSystemFont,sans-serif', minHeight: "100vh" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ maxWidth: 1180, margin: "0 auto", gap: 30, alignItems: "center", padding: "64px 28px 80px", position: "relative", overflow: "clip" }}
      >
        {/* Blue glow */}
        <div style={{ position: "absolute", top: -100, right: -60, width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle,rgba(10,102,255,.14),transparent 65%)", filter: "blur(20px)", pointerEvents: "none" }} />

        {/* Left: copy */}
        <div style={{ position: "relative", zIndex: 2, animation: "fadeUp .9s cubic-bezier(.16,1,.3,1) both" }}>
          <div style={monoBlue}>The retail operating system</div>
          <h1 style={{ margin: "22px 0 20px", fontSize: "clamp(36px,4.5vw,58px)", lineHeight: 1.03, fontWeight: 600, letterSpacing: "-.035em", color: INK }}>
            Run your store<br />like the big<br />players do.
          </h1>
          <p style={{ margin: "0 0 32px", fontSize: 18, lineHeight: 1.5, color: "#3f3f46", maxWidth: 430 }}>
            Swish unifies your storefront, inventory, and analytics into one calm dashboard — powered by agents that do the busywork.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 22, flexWrap: "wrap" }}>
            <button
              onClick={handleCTA}
              className="mk-btnp"
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "14px 24px", borderRadius: 13, background: INK, color: "#fff", fontSize: 15, fontWeight: 500, boxShadow: "0 12px 28px -12px rgba(0,0,0,.6)" }}
            >
              {session ? "Go to dashboard →" : "Continue with Google"}
            </button>
            <Link
              to="/stores"
              className="mk-btnp"
              style={{ padding: "14px 22px", borderRadius: 13, color: INK, fontSize: 15, fontWeight: 500, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)", textDecoration: "none", display: "inline-block" }}
            >
              Browse stores →
            </Link>
          </div>
          <div style={{ fontSize: 13, color: "#71717a" }}>No credit card · Live in minutes · Cancel anytime</div>
        </div>

        {/* Right: dashboard mockup (hidden on mobile) */}
        <div className="hidden md:block" style={{ position: "relative", zIndex: 2, perspective: 1100, animation: "floaty 6s ease-in-out infinite" }}>
          <div style={{ borderRadius: 22, padding: 22, background: "rgba(255,255,255,.7)", backdropFilter: "blur(24px) saturate(180%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.9),0 0 0 1px rgba(0,0,0,.06),0 40px 80px -30px rgba(10,30,80,.35)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "monospace", fontSize: 11, color: "#71717a", marginBottom: 6 }}>Revenue · last 30 days</div>
                <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-.03em", fontVariantNumeric: "tabular-nums" }}>$48,210</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 9, background: "rgba(10,102,255,.1)", color: BLUE, fontSize: 12, fontWeight: 600 }}>▲ 12.4%</div>
            </div>
            {/* Bar chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 96, marginBottom: 20 }}>
              {[42, 58, 50, 73, 64, 88, 100].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    borderRadius: 6,
                    background: i >= 5 ? `linear-gradient(180deg,${BLUE},#5a9bff)` : i >= 3 ? "#d4d4d8" : "#e4e4e7",
                    transformOrigin: "bottom",
                    animation: "growBar 1s cubic-bezier(.16,1,.3,1) both",
                    animationDelay: `${i * 0.07}s`,
                  }}
                />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["Orders today", "134"], ["In stock", "1,902"]].map(([label, val]) => (
                <div key={label} style={{ padding: "13px 15px", borderRadius: 13, background: "rgba(255,255,255,.7)", boxShadow: "0 0 0 1px rgba(0,0,0,.05)" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 10.5, color: "#71717a", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Toast */}
          <div style={{ position: "absolute", bottom: -18, left: -22, padding: "12px 16px", borderRadius: 14, background: INK, color: "#fff", boxShadow: "0 20px 40px -16px rgba(0,0,0,.5)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: BLUE, animation: "pulseDot 1.8s ease-out infinite" }} />
            <span style={{ fontSize: 12.5, fontWeight: 500, animation: "toastIn .4s ease both" }}>Agent restocked 3 items</span>
          </div>
        </div>
      </section>

      {/* ── LOGO STRIP ── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 28px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30, flexWrap: "wrap", justifyContent: "center", opacity: 0.55, fontSize: 17, letterSpacing: "-.01em", fontWeight: 500 }}>
          <span style={{ ...mono, color: "#a1a1aa" }}>Integrates directly with major POS systems</span>
          {["Shopify", "Square", "Clover", "Toast", "Lightspeed"].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </section>

      {/* ── FEATURES BENTO ── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 28px 84px" }}>
        <div style={{ textAlign: "center", marginBottom: 46 }}>
          <div style={mono}>What's inside</div>
          <h2 style={{ margin: "16px 0 14px", fontSize: 36, fontWeight: 600, letterSpacing: "-.035em", color: INK }}>A complete system, working while you sleep.</h2>
          <p style={{ margin: "0 auto", fontSize: 17, lineHeight: 1.5, color: "#52525b", maxWidth: 520 }}>Every Swish store ships with these built in. No plugins, no setup — they just run.</p>
        </div>

        <div className="grid grid-cols-12" style={{ gap: 18 }}>

          {/* 01: AI store builder */}
          <div className="mk-fcard col-span-12 md:col-span-7" style={{ padding: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
              <div style={{ maxWidth: 280 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 21, fontWeight: 600, letterSpacing: "-.02em", color: INK }}>AI store builder</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#52525b" }}>Describe your shop in a sentence. Swish assembles the catalog, pricing, and storefront in seconds.</p>
              </div>
              <span style={mono}>01</span>
            </div>
            <div style={{ borderRadius: 16, background: "#f7f7f8", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)", padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE, flexShrink: 0 }} />
                <div style={{ position: "relative", overflow: "hidden", whiteSpace: "nowrap", fontFamily: "monospace", fontSize: 12.5, color: "#3f3f46", animation: "typeline 5s steps(40) infinite", borderRight: `2px solid ${BLUE}`, paddingRight: 3 }}>
                  a flowery casual dress boutique, 12 styles…
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9 }}>
                {/*[0.2, 0.6, 1, 1.4].map((delay) => (
                  <div key={delay} className="mk-ph" style={{ aspectRatio: "1", borderRadius: 10, animation: "assemble 4s ease-in-out infinite", animationDelay: `${delay}s` }} />
                ))*/}
                {[
                  { delay: 0.2, src: "https://cdn.saksfifthavenue.com/is/image/saks/0400026514297_FALLENROSES?wid=2000&hei=2667&resMode=sharp2&op_usm=0.9,1.0,8,0&fmt=webp" }, // Sneaker 1
                  { delay: 0.6, src: "https://cdn.saksfifthavenue.com/is/image/saks/0400026584811_ROSEWATERMULTI?wid=2000&hei=2667&resMode=sharp2&op_usm=0.9,1.0,8,0&fmt=webp" }, // Sneaker 2
                  { delay: 1.0, src: "https://cdn.saksfifthavenue.com/is/image/saks/0400026220734_VIOLETAMULTI?wid=2000&hei=2667&resMode=sharp2&op_usm=0.9,1.0,8,0&fmt=webp" }, // Sneaker 3
                  { delay: 1.4, src: "https://cdn.saksfifthavenue.com/is/image/saks/0400026609333_REDWHITE?wid=2000&hei=2667&resMode=sharp2&op_usm=0.9,1.0,8,0&fmt=webp" }, // Sneaker 4
                ].map(({ delay, src }) => (
                  <div 
                    key={delay} 
                    className="mk-ph" 
                    style={{ 
                      aspectRatio: "0.75", 
                      borderRadius: 10, 
                      animation: "assemble 4s ease-in-out infinite", 
                      animationDelay: `${delay}s`,
                      // 2. Use background styles to seamlessly fit the image inside the animated box
                      backgroundImage: `url(${src})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 02: Real-time analytics */}
          <div className="mk-fcard col-span-12 md:col-span-5" style={{ padding: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
              <div style={{ maxWidth: 230 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 21, fontWeight: 600, letterSpacing: "-.02em", color: INK }}>Real-time analytics</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#52525b" }}>Revenue, stock, and customer insight the moment a sale lands.</p>
              </div>
              <span style={mono}>02</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 118, padding: "0 4px" }}>
              {[0, 0.2, 0.45, 0.7, 0.95, 1.2].map((delay, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: "100%",
                    borderRadius: "7px 7px 0 0",
                    background: i >= 4 ? `linear-gradient(180deg,${BLUE},#7db0ff)` : i >= 2 ? "#dcdce0" : "#ececed",
                    transformOrigin: "bottom",
                    animation: "barPulse 1.6s ease-in-out infinite alternate",
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* 03: Customer intent */}
          <div className="mk-fcard col-span-12 md:col-span-6" style={{ padding: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ maxWidth: 330 }}>
                <span style={mono}>03</span>
                <h3 style={{ margin: "8px 0", fontSize: 21, fontWeight: 600, letterSpacing: "-.02em", color: INK }}>Reads every customer's intent</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#52525b" }}>Swish captures the signals behind each visit — what they browsed, lingered on, and almost bought.</p>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 11px", borderRadius: 999, background: "rgba(10,102,255,.1)", color: BLUE, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: BLUE, animation: "pulseDot 1.8s ease-out infinite" }} />
                92 wishlisted
              </div>
            </div>
            <div style={{ position: "relative", height: 124, borderRadius: 14, background: "#f7f7f8", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", flexDirection: "column", gap: 9, padding: 14, animation: "scrollUp 9s linear infinite" }}>
                {(
                  [
                    ["Viewed Air Form Low · 3×", "HIGH", BLUE, "rgba(10,102,255,.12)"],
                    ["Added to cart, then left", "HOT", "#fff", BLUE],
                    ["Compared 2 styles", "MED", "#71717a", "rgba(0,0,0,.06)"],
                    ["Back within 24h", "HIGH", BLUE, "rgba(10,102,255,.12)"],
                    ["Price-checked twice", "HOT", "#fff", BLUE],
                    ["Viewed Air Form Low · 3×", "HIGH", BLUE, "rgba(10,102,255,.12)"],
                    ["Added to cart, then left", "HOT", "#fff", BLUE],
                    ["Compared 2 styles", "MED", "#71717a", "rgba(0,0,0,.06)"],
                    ["Back within 24h", "HIGH", BLUE, "rgba(10,102,255,.12)"],
                    ["Price-checked twice", "HOT", "#fff", BLUE],
                  ] as [string, string, string, string][]
                ).map(([text, badge, badgeColor, badgeBg], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: badge === "MED" ? "#c4c4c8" : BLUE, flexShrink: 0 }} />
                    <span style={{ color: "#3f3f46", flex: 1 }}>{text}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 10, padding: "3px 8px", borderRadius: 999, background: badgeBg, color: badgeColor, fontWeight: 500 }}>{badge}</span>
                  </div>
                ))}
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 30, background: "linear-gradient(transparent,#f7f7f8)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* 04: Win-back marketing */}
          <div className="mk-fcard col-span-12 md:col-span-6" style={{ padding: 30 }}>
            <div style={{ marginBottom: 16, maxWidth: 340 }}>
              <span style={mono}>04</span>
              <h3 style={{ margin: "8px 0", fontSize: 21, fontWeight: 600, letterSpacing: "-.02em", color: INK }}>Wins back high-intent shoppers</h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#52525b" }}>Swish targets the customers most likely to buy with the right offer at the right moment.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div style={{ position: "relative", width: 124, height: 124, flexShrink: 0 }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", boxShadow: "inset 0 0 0 1px rgba(10,102,255,.16)" }} />
                <div style={{ position: "absolute", inset: 20, borderRadius: "50%", boxShadow: "inset 0 0 0 1px rgba(10,102,255,.12)" }} />
                <div style={{ position: "absolute", inset: 42, borderRadius: "50%", boxShadow: "inset 0 0 0 1px rgba(10,102,255,.1)" }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg,rgba(10,102,255,.3),rgba(10,102,255,0) 55%)", animation: "spinSlow 3.2s linear infinite" }} />
                {(
                  [["18%", "28%", 0.2], ["60%", "22%", 1], ["32%", "66%", 1.7], ["68%", "62%", 2.5]] as [string, string, number][]
                ).map(([top, left, delay], i) => (
                  <span key={i} style={{ position: "absolute", top, left, width: 9, height: 9, borderRadius: "50%", animation: "nodeSeq 3.2s ease-in-out infinite", animationDelay: `${delay}s` }} />
                ))}
                <span style={{ position: "absolute", top: "47%", left: "47%", width: 8, height: 8, borderRadius: "50%", background: INK }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ borderRadius: 13, background: INK, color: "#fff", padding: "14px 16px", marginBottom: 12 }}>
                  <div style={{ fontFamily: "monospace", fontSize: 10.5, color: "#71717a", marginBottom: 6 }}>Recovered this week</div>
                  <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-.02em" }}>$3,480</div>
                </div>
                <div style={{ position: "relative", height: 30 }}>
                  <div style={{ position: "absolute", inset: 0, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "rgba(10,102,255,.1)", color: BLUE, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", animation: "popBadge 4s ease-in-out infinite" }}>✓ Offer sent → sale recovered</div>
                </div>
              </div>
            </div>
          </div>

          {/* 05: Autonomous agents */}
          <div className="mk-fcard col-span-12 md:col-span-4" style={{ padding: 30 }}>
            <span style={mono}>05</span>
            <h3 style={{ margin: "8px 0", fontSize: 20, fontWeight: 600, letterSpacing: "-.02em", color: INK }}>Autonomous agents</h3>
            <p style={{ margin: "0 0 22px", fontSize: 14, lineHeight: 1.55, color: "#52525b" }}>They restock, reprice, and run campaigns on their own.</p>
            <div style={{ position: "relative", height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", width: 108, height: 108, borderRadius: "50%", boxShadow: "inset 0 0 0 1px rgba(10,102,255,.18)", animation: "spinSlow 14s linear infinite" }}>
                {([{ top: -5, left: "50%", ml: -5, delay: 0 }, { bottom: -5, left: "50%", ml: -5, delay: 0.8 }, { left: -5, top: "50%", mt: -5, delay: 1.2 }, { right: -5, top: "50%", mt: -5, delay: 1.6 }] as { top?: number; bottom?: number; left?: number | string; right?: number; ml?: number; mt?: number; delay: number }[]).map((p, i) => (
                  <span key={i} style={{ position: "absolute", top: p.top, bottom: p.bottom, left: p.left, right: p.right, marginLeft: p.ml, marginTop: p.mt, width: 10, height: 10, borderRadius: "50%", animation: "nodeSeq 2.4s ease-in-out infinite", animationDelay: `${p.delay}s` }} />
                ))}
              </div>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: INK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 10px 24px -10px rgba(0,0,0,.6)" }}>✳</div>
            </div>
          </div>

          {/* 06: Inventory sync */}
          <div className="mk-fcard col-span-12 md:col-span-4" style={{ padding: 30 }}>
            <span style={mono}>06</span>
            <h3 style={{ margin: "8px 0", fontSize: 20, fontWeight: 600, letterSpacing: "-.02em", color: INK }}>Inventory that syncs itself</h3>
            <p style={{ margin: "0 0 22px", fontSize: 14, lineHeight: 1.55, color: "#52525b" }}>Stock counts stay live across every channel, always.</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, height: 130 }}>
              <div style={{ position: "relative", width: 70, height: 70 }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", boxShadow: "inset 0 0 0 3px rgba(10,102,255,.16)" }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: BLUE, borderRightColor: BLUE, animation: "spinSlow 1.6s linear infinite" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: BLUE }}>⟳</div>
              </div>
              <div>
                <div style={{ height: 34, overflow: "hidden" }}>
                  <div style={{ animation: "flipUp 3s ease-in-out infinite" }}>
                    <div style={{ height: 34, fontSize: 26, fontWeight: 600, letterSpacing: "-.02em" }}>1,902</div>
                    <div style={{ height: 34, fontSize: 26, fontWeight: 600, letterSpacing: "-.02em" }}>1,948</div>
                  </div>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 11, color: "#22a06b" }}>● synced</div>
              </div>
            </div>
          </div>

          {/* 07: Live in minutes */}
          <div className="mk-fcard col-span-12 md:col-span-4" style={{ padding: 30 }}>
            <span style={mono}>07</span>
            <h3 style={{ margin: "8px 0", fontSize: 20, fontWeight: 600, letterSpacing: "-.02em", color: INK }}>Live in minutes</h3>
            <p style={{ margin: "0 0 22px", fontSize: 14, lineHeight: 1.55, color: "#52525b" }}>Name it, and your storefront is online. That fast.</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 130 }}>
              <div style={{ position: "relative", width: 96, height: 96 }}>
                <svg width="96" height="96" viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(10,102,255,.14)" strokeWidth="6" />
                  <circle cx="32" cy="32" r="26" fill="none" stroke={BLUE} strokeWidth="6" strokeLinecap="round" strokeDasharray="163" strokeDashoffset="8" style={{ animation: "ringDash 3.4s ease-in-out infinite" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.02em" }}>00:28</span>
                  <span style={{ fontFamily: "monospace", fontSize: 9.5, color: "#a1a1aa" }}>to live</span>
                </div>
              </div>
            </div>
          </div>

          {/* 08: Campaigns on autopilot */}
          <div className="mk-fcard col-span-12" style={{ padding: "30px 34px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26, flexWrap: "wrap", gap: 10 }}>
              <div>
                <span style={mono}>08</span>
                <h3 style={{ margin: "8px 0 6px", fontSize: 21, fontWeight: 600, letterSpacing: "-.02em", color: INK }}>Campaigns on autopilot</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#52525b", maxWidth: 520 }}>Swish drafts, schedules, and ships promotions end-to-end — you just approve.</p>
              </div>
              <Link to="/pricing" className="mk-btnp" style={{ padding: "11px 18px", borderRadius: 12, background: INK, color: "#fff", fontSize: 13.5, fontWeight: 500, textDecoration: "none" }}>
                See it in Pro →
              </Link>
            </div>
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, paddingTop: 8 }}>
              <div style={{ position: "absolute", top: 23, left: "6%", right: "6%", height: 2, background: "rgba(0,0,0,.08)" }} />
              <div style={{ position: "absolute", top: 18, width: 12, height: 12, borderRadius: "50%", background: BLUE, boxShadow: "0 0 14px rgba(10,102,255,.8)", animation: "travel 4.2s linear infinite" }} />
              {([["Draft", "Agent writes copy", "-.24s"], ["Schedule", "Best send time", "-3.34s"], ["Approve", "One tap from you", "-2.25s"], ["Ship", "Live to customers", "-1.16s"]] as [string, string, string][]).map(([step, desc, delay], i) => (
                <div key={i} style={{ position: "relative", textAlign: "center" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#fff", color: BLUE, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 12, fontWeight: 500, animation: "stepLight 4.2s linear infinite", animationDelay: delay }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 3, color: INK }}>{step}</div>
                  <div style={{ fontSize: 12, color: "#71717a" }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 09: POS integrations */}
          <div className="mk-fcard col-span-12" style={{ padding: "30px 34px" }}>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 36, alignItems: "center" }}>
              <div>
                <span style={mono}>09</span>
                <h3 style={{ margin: "8px 0", fontSize: 21, fontWeight: 600, letterSpacing: "-.02em", color: INK }}>Connects to any POS, seamlessly</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#52525b", maxWidth: 430 }}>Already running Square, Shopify, or Clover? Swish syncs your catalog, inventory, and sales both ways — no migration, no downtime.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 11 }}>
                  {["Square", "Shopify POS", "Clover", "Toast", "Lightspeed"].map((pos, i) => (
                    <div key={pos} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 104, textAlign: "center", padding: "8px 0", borderRadius: 10, background: "#f4f4f5", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.07)", fontSize: 12.5, fontWeight: 600, color: INK }}>{pos}</div>
                      <div style={{ flex: 1, height: 2, background: "rgba(0,0,0,.08)", position: "relative", overflow: "hidden", borderRadius: 2 }}>
                        <div style={{ position: "absolute", top: -2, width: 6, height: 6, borderRadius: "50%", background: BLUE, boxShadow: "0 0 8px rgba(10,102,255,.8)", animation: "travel 2.4s linear infinite", animationDelay: `${i * 0.45}s` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ position: "absolute", inset: -7, borderRadius: 22, boxShadow: "0 0 0 1px rgba(10,102,255,.25)", animation: "pulseDot 2s ease-out infinite" }} />
                  <div style={{ width: 66, height: 66, borderRadius: 18, background: INK, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 28px -10px rgba(0,0,0,.6)" }}>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>✳</span>
                    <span style={{ fontFamily: "monospace", fontSize: 9, marginTop: 3 }}>SWISH</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section style={{ background: "#fafafa", borderTop: "1px solid rgba(0,0,0,.06)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 28px 76px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={mono}>Pricing</div>
            <h2 style={{ margin: "16px 0 12px", fontSize: 32, fontWeight: 600, letterSpacing: "-.03em", color: INK }}>Simple plans that scale with you.</h2>
            <p style={{ margin: "0 0 4px", fontSize: 16, color: "#52525b" }}>
              Start free for 14 days.{" "}
              <Link to="/pricing" style={{ color: BLUE, fontWeight: 500, textDecoration: "none" }}>Compare every feature →</Link>
            </p>
          </div>

          {/* Billing toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 32 }}>
            <div style={{ display: "inline-flex", padding: 4, borderRadius: 12, background: "rgba(0,0,0,.06)" }}>
              {(["monthly", "annual"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setBilling(p)}
                  className="mk-btnp"
                  style={{ padding: "8px 20px", borderRadius: 9, fontSize: 13.5, fontWeight: 500, background: billing === p ? "#fff" : "transparent", color: billing === p ? INK : "#71717a", boxShadow: billing === p ? "0 1px 4px rgba(0,0,0,.12)" : "none", textTransform: "capitalize" }}
                >
                  {p}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 999, background: "rgba(10,102,255,.1)", color: BLUE }}>Save 20%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 18 }}>
            {previewTiers.map((t) => (
              <div
                key={t.name}
                className="mk-pcard"
                style={{ borderRadius: 20, padding: 28, background: t.dark ? INK : "#fff", color: t.dark ? "#fff" : INK, boxShadow: t.dark ? "0 30px 60px -24px rgba(0,0,0,.5)" : "0 0 0 1px rgba(0,0,0,.07)", position: "relative", overflow: "hidden" }}
              >
                {t.dark && (
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "38%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent)", animation: "sheen 4.5s ease-in-out infinite", pointerEvents: "none" }} />
                )}
                {t.dark && (
                  <div style={{ position: "absolute", top: 18, right: 18, padding: "4px 10px", borderRadius: 7, background: "rgba(10,102,255,.22)", color: "#5a9bff", fontSize: 10.5, fontWeight: 600, fontFamily: "monospace" }}>POPULAR</div>
                )}
                <div style={{ fontFamily: "monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: t.dark ? "#71717a" : "#a1a1aa", marginBottom: 14 }}>{t.tag}</div>
                <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-.03em", marginBottom: 4 }}>
                  {priceLabel(t)}
                  {t.monthly !== null && <span style={{ fontSize: 15, fontWeight: 400, color: t.dark ? "#71717a" : "#a1a1aa" }}>{priceSub(t)}</span>}
                </div>
                <p style={{ margin: "0 0 18px", fontSize: 13, color: t.dark ? "#a1a1aa" : "#71717a", lineHeight: 1.5 }}>{t.blurb}</p>
                <button
                  onClick={t.enterprise ? () => void navigate({ to: "/contact" }) : () => handlePlanTierClick(t.name)}
                  className="mk-btnp"
                  style={{ width: "100%", padding: 11, borderRadius: 11, textAlign: "center", fontSize: 13.5, fontWeight: 500, background: t.dark ? "#fff" : "transparent", color: t.dark ? INK : INK, boxShadow: t.dark ? "none" : "inset 0 0 0 1px rgba(0,0,0,.14)", cursor: "pointer" }}
                >
                  {t.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "64px 28px" }}>
        <h2 style={{ margin: "0 0 28px", textAlign: "center", fontSize: 30, fontWeight: 600, letterSpacing: "-.03em", color: INK }}>Frequently asked questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 28px 80px" }}>
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 28, background: INK, color: "#fff", padding: "64px 40px", textAlign: "center" }}>
          <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 620, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(10,102,255,.4),transparent 62%)", filter: "blur(20px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <h2 style={{ margin: "0 0 14px", fontSize: "clamp(28px,3.5vw,38px)", fontWeight: 600, letterSpacing: "-.035em", color: "#fff" }}>Put your growth on autopilot.</h2>
            <p style={{ margin: "0 auto 30px", fontSize: 17, color: "rgba(255,255,255,.62)", maxWidth: 440 }}>Start your 14-day free trial today. No credit card required.</p>
            <button
              onClick={handleCTA}
              className="mk-btnp"
              style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "15px 28px", borderRadius: 14, background: BLUE, color: "#fff", fontSize: 15, fontWeight: 500, boxShadow: "0 16px 40px -12px rgba(10,102,255,.7)" }}
            >
              Get started free →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(0,0,0,.06)", padding: "48px 28px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 24 }}>

        <div style={{ display: "flex", alignItems: "center", height: 18, flexShrink: 0 }}>
          <img 
            src="/your-logo.png" 
            alt="Swish Logo" 
            style={{ 
              height: "100%", // Inherits the 18px height from the parent container
              width: "auto",
              display: "block"
            }} 
          />
        </div>
          <div style={{ fontSize: 13, color: "#71717a" }}>© 2026 Swish Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
