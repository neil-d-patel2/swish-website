import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Check, Minus, ChevronDown, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

const serif = "'Noto Serif', serif";
const body = "'Inter', sans-serif";
const label = "'Public Sans', sans-serif";

// inset 1px ring used across the design system's cards
const ghostBorder = "inset 0 0 0 1px rgba(195,198,213,0.15)";
const primaryGradient = "linear-gradient(90deg, #094cb2, #3366cc)";

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

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf9fa", color: "#1b1c1d", fontFamily: body }}
    >
      <div className="px-6 md:px-12 lg:px-16">
        <Navbar variant="light" />
      </div>

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-16">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto mb-12">
          <span
            className="inline-block text-xs font-medium uppercase tracking-[0.18em] mb-5"
            style={{ fontFamily: label, color: "#094cb2" }}
          >
            Pricing
          </span>
          <h1
            className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-5"
            style={{ fontFamily: serif, color: "#1b1c1d" }}
          >
            Transparent pricing for infinite growth.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "#434653" }}>
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
            style={{ background: "#efedee", boxShadow: ghostBorder }}
          >
            {(["monthly", "annual"] as const).map((period) => {
              const active = billing === period;
              return (
                <button
                  key={period}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setBilling(period)}
                  className="px-5 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#094cb2]"
                  style={{
                    fontFamily: label,
                    color: active ? "#ffffff" : "#434653",
                    background: active ? primaryGradient : "transparent",
                    boxShadow: active ? "0 1px 3px rgb(0 0 0 / 0.12)" : "none",
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
              fontFamily: label,
              color: "#4a3f00",
              background: "rgba(191,171,73,0.22)",
            }}
          >
            Save 20%
          </span>
        </div>

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
                  background: "#ffffff",
                  boxShadow: isPro
                    ? "0 0 0 2px #094cb2, 0 20px 40px -12px rgb(9 76 178 / 0.28)"
                    : `${ghostBorder}, 0 8px 30px rgb(0 0 0 / 0.05)`,
                }}
              >
                {isPro && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap"
                    style={{
                      fontFamily: label,
                      color: "#ffffff",
                      background: primaryGradient,
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </span>
                )}

                <span
                  className="text-xs font-medium uppercase tracking-[0.16em] mb-3"
                  style={{ fontFamily: label, color: "#737784" }}
                >
                  {tier.tag}
                </span>
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: serif, color: "#1b1c1d" }}
                >
                  {tier.name}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: "#434653" }}
                >
                  {tier.blurb}
                </p>

                <div className="flex items-end gap-1.5 mb-1 min-h-[3rem]">
                  {price.strike && (
                    <span
                      className="text-lg line-through tabular-nums"
                      style={{ color: "#a8aab4" }}
                    >
                      {price.strike}
                    </span>
                  )}
                  <span
                    className="text-5xl font-bold tabular-nums leading-none"
                    style={{ color: "#1b1c1d" }}
                  >
                    {price.amount}
                  </span>
                </div>
                <span className="text-sm mb-7" style={{ color: "#737784" }}>
                  {price.sub}
                </span>

                <ul className="space-y-3.5 mb-8 flex-grow">
                  {tier.features.map((f) => (
                    <li
                      key={f.text}
                      className="flex items-start gap-3 text-sm"
                      style={{ color: f.included ? "#1b1c1d" : "#a8aab4" }}
                    >
                      {f.included ? (
                        <span
                          className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "rgba(9,76,178,0.1)" }}
                        >
                          <Check
                            className="w-3.5 h-3.5"
                            style={{ color: "#094cb2" }}
                          />
                        </span>
                      ) : (
                        <span className="mt-0.5 w-5 h-5 flex items-center justify-center shrink-0">
                          <Minus
                            className="w-3.5 h-3.5"
                            style={{ color: "#c3c6d5" }}
                          />
                        </span>
                      )}
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className="w-full py-3.5 rounded-full font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#094cb2] focus-visible:ring-offset-2"
                  style={
                    isPro
                      ? {
                          fontFamily: body,
                          color: "#ffffff",
                          background: primaryGradient,
                        }
                      : {
                          fontFamily: body,
                          color: "#094cb2",
                          background: "#ffffff",
                          boxShadow: "inset 0 0 0 1.5px #094cb2",
                        }
                  }
                >
                  {tier.cta}
                </button>
              </div>
            );
          })}
        </section>

        {/* Feature comparison table */}
        <section className="mb-28">
          <h2
            className="text-3xl font-bold text-center mb-3 tracking-tight"
            style={{ fontFamily: serif, color: "#1b1c1d" }}
          >
            Compare every feature
          </h2>
          <p
            className="text-center text-base mb-10"
            style={{ color: "#434653" }}
          >
            A side-by-side look at what each plan unlocks.
          </p>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#ffffff",
              boxShadow: `${ghostBorder}, 0 8px 30px rgb(0 0 0 / 0.04)`,
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr style={{ background: "#f5f3f4" }}>
                    <th
                      className="py-4 px-6 text-xs font-semibold uppercase tracking-[0.12em]"
                      style={{ fontFamily: label, color: "#434653" }}
                    >
                      Feature
                    </th>
                    {tiers.map((t) => (
                      <th
                        key={t.name}
                        className="py-4 px-6 text-center text-sm font-bold"
                        style={{
                          fontFamily: serif,
                          color: t.highlighted ? "#094cb2" : "#1b1c1d",
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
                        borderTop: "1px solid #efedee",
                        background: i % 2 ? "#faf9fa" : "#ffffff",
                      }}
                    >
                      <td
                        className="py-4 px-6 font-medium"
                        style={{ color: "#1b1c1d" }}
                      >
                        {row.feature}
                      </td>
                      {row.values.map((val, j) => (
                        <td key={j} className="py-4 px-6 text-center">
                          {typeof val === "boolean" ? (
                            val ? (
                              <Check
                                className="w-5 h-5 mx-auto"
                                style={{ color: "#094cb2" }}
                              />
                            ) : (
                              <Minus
                                className="w-5 h-5 mx-auto"
                                style={{ color: "#c3c6d5" }}
                              />
                            )
                          ) : (
                            <span style={{ color: "#434653" }}>{val}</span>
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
            style={{ fontFamily: serif, color: "#1b1c1d" }}
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
          style={{ background: primaryGradient }}
        >
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: serif, color: "#ffffff" }}
          >
            Ready to put your growth on autopilot?
          </h2>
          <p
            className="text-base mb-8 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            Start your 14-day free trial today. No credit card required.
          </p>
          <button
            className="px-8 py-3.5 rounded-full font-semibold transition-transform duration-200 cursor-pointer active:scale-[0.98] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{
              fontFamily: body,
              color: "#094cb2",
              background: "#ffffff",
            }}
          >
            Get Started Free
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="w-full py-16 border-t mt-16"
        style={{ background: "#ffffff", borderColor: "#e3e2e3" }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 lg:px-16 max-w-6xl mx-auto gap-8">
          <div
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: serif, color: "#1b1c1d" }}
          >
            Swish
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Security", "Status"].map(
              (l) => (
                <a
                  key={l}
                  href="#"
                  className="text-sm transition-colors hover:text-[#094cb2]"
                  style={{ fontFamily: label, color: "#434653" }}
                >
                  {l}
                </a>
              ),
            )}
          </div>
          <div
            className="text-sm"
            style={{ fontFamily: label, color: "#434653" }}
          >
            © 2026 Swish Inc. All rights reserved.
          </div>
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
      style={{ background: "#ffffff", boxShadow: ghostBorder }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#094cb2]"
      >
        <span className="text-base font-medium" style={{ color: "#1b1c1d" }}>
          {question}
        </span>
        <ChevronDown
          className="w-5 h-5 shrink-0 transition-transform duration-300"
          style={{
            color: "#737784",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>
      <div
        className="grid transition-all duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p
            className="px-6 pb-5 text-sm leading-relaxed"
            style={{ color: "#434653" }}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
