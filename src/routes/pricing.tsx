import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Check, Minus, ChevronDown, Sparkles } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

// Cream + black design system (shared with contact/stores)
const cream = "var(--mk-cream)";
const creamCard = "var(--mk-cream-card)";
const creamDeep = "var(--mk-cream-deep)";
const toggleBg = "var(--mk-toggle)";
const ink = "var(--mk-ink)";
const muted = "var(--mk-muted)";
const faint = "var(--mk-faint)";
const surface = "var(--mk-surface)";
const onAccent = "var(--mk-on-accent)";
const heading = "var(--font-heading)";
const body = "var(--font-body)";
const hairline = "var(--mk-hairline)";

type Billing = "monthly" | "annual";

type Tier = {
  name: string;
  tag: string;
  monthly: number | null; // null = custom pricing
  blurb: string;
  features: { text: string; included: boolean }[];
  cta: string;
  highlighted: boolean;
};

const tiers: Tier[] = [
  {
    name: "Starter",
    tag: "Entry Level",
    monthly: 29,
    blurb: "Everything a single store needs to start growing with AI.",
    features: [
      { text: "Basic insights engine", included: true },
      { text: "1 connected store", included: true },
      { text: "Standard support", included: true },
      { text: "Advanced analytics", included: false },
      { text: "AI campaign automation", included: false },
    ],
    cta: "Select Starter",
    highlighted: false,
  },
  {
    name: "Pro",
    tag: "Accelerator",
    monthly: 79,
    blurb: "For growing brands that want automation doing the heavy lifting.",
    features: [
      { text: "Advanced analytics dashboard", included: true },
      { text: "Up to 3 connected stores", included: true },
      { text: "Priority 24/7 support", included: true },
      { text: "AI campaign automation", included: true },
      { text: "Custom API integrations", included: false },
    ],
    cta: "Get Started with Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    tag: "Global Scale",
    monthly: null,
    blurb: "Tailored infrastructure, security, and support at any scale.",
    features: [
      { text: "Unlimited connected stores", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom API integrations", included: true },
      { text: "SLA & enterprise security", included: true },
      { text: "Single sign-on (SSO)", included: true },
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

// Full feature matrix for the comparison table
const comparison: { feature: string; values: (string | boolean)[] }[] = [
  { feature: "Connected stores", values: ["1", "3", "Unlimited"] },
  { feature: "Analytics", values: ["Basic", "Advanced", "Advanced + custom"] },
  { feature: "AI campaign automation", values: [false, true, true] },
  {
    feature: "Support",
    values: ["Standard", "Priority 24/7", "Dedicated manager"],
  },
  { feature: "Custom API integrations", values: [false, false, true] },
  { feature: "SLA & enterprise security", values: [false, false, true] },
  { feature: "Team seats", values: ["1", "5", "Unlimited"] },
];

const faqs = [
  {
    q: "Can I change plans later?",
    a: "Absolutely. Upgrade or downgrade at any time from your dashboard — changes are prorated automatically, so you only pay for what you use.",
  },
  {
    q: "Is there a free trial?",
    a: "Every paid plan includes a 14-day free trial. No credit card is required to start, and you can cancel before it ends with no charge.",
  },
  {
    q: "What counts as a connected store?",
    a: "A connected store is any storefront you link to Swish — Shopify, WooCommerce, or a custom integration. Each store syncs its own catalog and analytics.",
  },
  {
    q: "How does annual billing work?",
    a: "Annual plans are billed once per year at a 20% discount versus paying monthly. You can switch back to monthly billing at your next renewal.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no long-term contracts on Starter or Pro — cancel in one click and you keep access until the end of your billing period.",
  },
];

function priceFor(tier: Tier, billing: Billing) {
  if (tier.monthly === null)
    return {
      amount: "Custom",
      sub: "Let's talk",
      strike: null as string | null,
    };
  if (billing === "annual") {
    const discounted = Math.round(tier.monthly * 0.8);
    return {
      amount: `$${discounted}`,
      sub: "/mo billed annually",
      strike: `$${tier.monthly}`,
    };
  }
  return { amount: `$${tier.monthly}`, sub: "/mo", strike: null };
}

function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const { session } = useSupabaseAuth();
  const navigate = useNavigate();
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);

  const startCheckout = async (plan: "starter" | "pro") => {
    if (!session) return;
    // Redirect already-subscribed users to their store instead of checkout
    const { data: store } = await supabase
      .from("stores")
      .select("plan")
      .eq("owner_id", session.user.id)
      .maybeSingle();
    if (store && store.plan !== "free") {
      void navigate({ to: "/store" });
      return;
    }
    setCheckoutLoading(plan);
    try {
      const url = await createCheckoutSession({
        plan,
        userId: session.user.id,
        email: session.user.email ?? "",
        origin: window.location.origin,
      });
      if (url) window.location.href = url;
    } finally {
      setCheckoutLoading(null);
    }
  };

  // After OAuth redirect back to /pricing, auto-start checkout for the saved plan
  useEffect(() => {
    if (!session) return;
    const pending = localStorage.getItem("swish_pending_plan");
    if (pending !== "starter" && pending !== "pro") return;
    localStorage.removeItem("swish_pending_plan");
    void startCheckout(pending);
  }, [session]);

  // Load user's active plan to reflect it in the UI
  useEffect(() => {
    if (!session) { setCurrentPlan(null); return; }
    supabase
      .from("stores")
      .select("plan")
      .eq("owner_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setCurrentPlan(data?.plan ?? null));
  }, [session]);

  const handlePlanClick = async (tier: Tier) => {
    if (tier.monthly === null) {
      void navigate({ to: "/contact" });
      return;
    }
    if (!session) {
      localStorage.setItem("swish_pending_plan", tier.name.toLowerCase());
      void supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/pricing` },
      });
      return;
    }
    await startCheckout(tier.name.toLowerCase() as "starter" | "pro");
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--mk-bg)", color: ink, fontFamily: body }}
    >
      <Navbar />

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-16">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto mb-12">
          <span
            className="inline-block text-xs font-medium uppercase tracking-[0.18em] mb-5"
            style={{ fontFamily: body, color: faint }}
          >
            Pricing
          </span>
          <h1
            className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-5"
            style={{ fontFamily: heading, color: ink }}
          >
            Transparent pricing for infinite growth.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: muted }}>
            Deploy AI-driven automation that scales with your ambition. Choose a
            plan that fuels your store's velocity — switch or cancel anytime.
          </p>
        </section>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-14">
          <div
            className="inline-flex p-1 rounded-full"
            role="tablist"
            aria-label="Billing period"
            style={{ background: toggleBg, boxShadow: hairline }}
          >
            {(["monthly", "annual"] as const).map((period) => {
              const active = billing === period;
              return (
                <button
                  key={period}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setBilling(period)}
                  className="px-5 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  style={{
                    fontFamily: body,
                    color: active ? onAccent : muted,
                    background: active ? ink : "transparent",
                    boxShadow: active ? "0 1px 3px rgb(0 0 0 / 0.2)" : "none",
                  }}
                >
                  {period}
                </button>
              );
            })}
          </div>
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{
              fontFamily: body,
              color: ink,
              background: "var(--mk-tint)",
            }}
          >
            Save 20%
          </span>
        </div>

        {/* Active plan banner */}
        {session && currentPlan && currentPlan !== "free" && (
          <div
            className="flex items-center justify-between gap-3 rounded-xl px-5 py-4 mb-8"
            style={{ background: surface, boxShadow: hairline }}
          >
            <p className="text-sm" style={{ color: ink }}>
              You're on the{" "}
              <strong>
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </strong>{" "}
              plan.
            </p>
            <button
              onClick={() => void navigate({ to: "/store" })}
              className="text-sm font-semibold shrink-0 cursor-pointer"
              style={{ color: ink }}
            >
              Manage →
            </button>
          </div>
        )}

        {/* Tier cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-28 items-start">
          {tiers.map((tier) => {
            const price = priceFor(tier, billing);
            const isPro = tier.highlighted;
            return (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 md:p-9 flex flex-col transition-all duration-300 ${
                  isPro
                    ? "md:-translate-y-3 md:hover:-translate-y-4"
                    : "hover:-translate-y-1"
                }`}
                style={{
                  background: surface,
                  boxShadow: isPro
                    ? "0 0 0 2px var(--mk-ink), 0 20px 40px -12px rgb(0 0 0 / 0.25)"
                    : `${hairline}, 0 8px 30px rgb(0 0 0 / 0.05)`,
                }}
              >
                {isPro && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap"
                    style={{
                      fontFamily: body,
                      color: onAccent,
                      background: ink,
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </span>
                )}

                <span
                  className="text-xs font-medium uppercase tracking-[0.16em] mb-3"
                  style={{ fontFamily: body, color: faint }}
                >
                  {tier.tag}
                </span>
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: heading, color: ink }}
                >
                  {tier.name}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: muted }}
                >
                  {tier.blurb}
                </p>

                <div className="flex items-end gap-1.5 mb-1 min-h-[3rem]">
                  {price.strike && (
                    <span
                      className="text-lg line-through tabular-nums"
                      style={{ color: faint }}
                    >
                      {price.strike}
                    </span>
                  )}
                  <span
                    className="text-5xl font-bold tabular-nums leading-none"
                    style={{ color: ink }}
                  >
                    {price.amount}
                  </span>
                </div>
                <span className="text-sm mb-7" style={{ color: faint }}>
                  {price.sub}
                </span>

                <ul className="space-y-3.5 mb-8 flex-grow">
                  {tier.features.map((f) => (
                    <li
                      key={f.text}
                      className="flex items-start gap-3 text-sm"
                      style={{ color: f.included ? ink : faint }}
                    >
                      {f.included ? (
                        <span
                          className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "var(--mk-tint)" }}
                        >
                          <Check
                            className="w-3.5 h-3.5"
                            style={{ color: ink }}
                          />
                        </span>
                      ) : (
                        <span className="mt-0.5 w-5 h-5 flex items-center justify-center shrink-0">
                          <Minus
                            className="w-3.5 h-3.5"
                            style={{ color: faint }}
                          />
                        </span>
                      )}
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => void handlePlanClick(tier)}
                  disabled={
                    checkoutLoading !== null ||
                    (currentPlan !== null &&
                      currentPlan !== "free" &&
                      currentPlan === tier.name.toLowerCase())
                  }
                  className="w-full py-3.5 rounded-full font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={
                    isPro
                      ? { fontFamily: body, color: onAccent, background: ink }
                      : {
                          fontFamily: body,
                          color: ink,
                          background: surface,
                          boxShadow: "inset 0 0 0 1.5px var(--mk-ink)",
                        }
                  }
                >
                  {currentPlan === tier.name.toLowerCase() && currentPlan !== "free"
                    ? "Current plan ✓"
                    : checkoutLoading === tier.name.toLowerCase()
                      ? "Redirecting…"
                      : tier.cta}
                </button>
              </div>
            );
          })}
        </section>

        {/* Feature comparison table */}
        <section className="mb-28">
          <h2
            className="text-3xl font-bold text-center mb-3 tracking-tight"
            style={{ fontFamily: heading, color: ink }}
          >
            Compare every feature
          </h2>
          <p className="text-center text-base mb-10" style={{ color: muted }}>
            A side-by-side look at what each plan unlocks.
          </p>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: surface,
              boxShadow: `${hairline}, 0 8px 30px rgb(0 0 0 / 0.04)`,
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr style={{ background: creamDeep }}>
                    <th
                      className="py-4 px-6 text-xs font-semibold uppercase tracking-[0.12em]"
                      style={{ fontFamily: body, color: muted }}
                    >
                      Feature
                    </th>
                    {tiers.map((t) => (
                      <th
                        key={t.name}
                        className="py-4 px-6 text-center text-sm font-bold"
                        style={{
                          fontFamily: heading,
                          color: t.highlighted ? ink : muted,
                        }}
                      >
                        {t.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {comparison.map((row, i) => (
                    <tr
                      key={row.feature}
                      style={{
                        borderTop: "1px solid var(--mk-border)",
                        background: i % 2 ? creamCard : surface,
                      }}
                    >
                      <td
                        className="py-4 px-6 font-medium"
                        style={{ color: ink }}
                      >
                        {row.feature}
                      </td>
                      {row.values.map((val, j) => (
                        <td key={j} className="py-4 px-6 text-center">
                          {typeof val === "boolean" ? (
                            val ? (
                              <Check
                                className="w-5 h-5 mx-auto"
                                style={{ color: ink }}
                              />
                            ) : (
                              <Minus
                                className="w-5 h-5 mx-auto"
                                style={{ color: faint }}
                              />
                            )
                          ) : (
                            <span style={{ color: muted }}>{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mb-24">
          <h2
            className="text-3xl font-bold text-center mb-10 tracking-tight"
            style={{ fontFamily: heading, color: ink }}
          >
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faqs.map((item) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} />
            ))}
          </div>
        </section>

        {/* Final CTA band */}
        <section
          className="rounded-2xl px-8 py-14 text-center relative overflow-hidden"
          style={{ background: cream, boxShadow: hairline }}
        >
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: heading, color: ink }}
          >
            Ready to put your growth on autopilot?
          </h2>
          <p
            className="text-base mb-8 max-w-xl mx-auto"
            style={{ color: muted }}
          >
            Start your 14-day free trial today. No credit card required.
          </p>
          <button
            className="px-8 py-3.5 rounded-full font-semibold transition-transform duration-200 cursor-pointer active:scale-[0.98] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            style={{ fontFamily: body, color: onAccent, background: ink }}
          >
            Get Started Free
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(0,0,0,.06)", padding: "48px 28px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", height: 18, flexShrink: 0 }}>
            <img src="/your-logo.png" alt="Swish Logo" style={{ height: "100%", width: "auto", display: "block" }} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <Link to="/privacy" className="mk-nlink" style={{ fontSize: 13, color: "#71717a" }}>Privacy Policy</Link>
            <a href="#" className="mk-nlink" style={{ fontSize: 13, color: "#71717a" }}>Terms of Service</a>
          </div>
          <div style={{ fontSize: 13, color: "#71717a" }}>© 2026 Swish Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: surface, boxShadow: hairline }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
      >
        <span className="text-base font-medium" style={{ color: ink }}>
          {question}
        </span>
        <ChevronDown
          className="w-5 h-5 shrink-0 transition-transform duration-300"
          style={{ color: faint, transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>
      <div
        className="grid transition-all duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p
            className="px-6 pb-5 text-sm leading-relaxed"
            style={{ color: muted }}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
