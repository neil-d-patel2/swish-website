import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

const tiers = [
  {
    name: "Starter",
    tag: "Entry Level",
    price: "$29",
    period: "/mo",
    features: [
      { text: "Basic insights engine", included: true },
      { text: "1 Connected Store", included: true },
      { text: "Standard support", included: true },
      { text: "Advanced Analytics", included: false },
    ],
    cta: "Select Starter",
    highlighted: false,
  },
  {
    name: "Pro",
    tag: "Accelerator",
    price: "$79",
    period: "/mo",
    features: [
      { text: "Advanced Analytics Dashboard", included: true },
      { text: "Up to 3 Connected Stores", included: true },
      { text: "Priority 24/7 Support", included: true },
      { text: "AI Campaign Automation", included: true },
    ],
    cta: "Get Started with Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    tag: "Global Scale",
    price: "Custom",
    period: "",
    features: [
      { text: "Unlimited Connected Stores", included: true },
      { text: "Dedicated Account Manager", included: true },
      { text: "Custom API Integrations", included: true },
      { text: "SLA & Enterprise Security", included: true },
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

function PricingPage() {
  return (
    <div className="text-white min-h-screen" style={{ background: "#021525" }}>
      <div className="relative w-full min-h-screen overflow-hidden flex flex-col">

        {/* Animated ambient blobs */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(115,66,226,0.18) 0%, transparent 65%)",
            top: "-15%",
            left: "-10%",
            filter: "blur(60px)",
            animation: "drift1 18s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 550,
            height: 550,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 65%)",
            bottom: "-10%",
            right: "-8%",
            filter: "blur(60px)",
            animation: "drift2 22s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(115,66,226,0.08) 0%, transparent 70%)",
            top: "50%",
            left: "60%",
            filter: "blur(50px)",
            animation: "drift1 26s ease-in-out infinite alternate-reverse",
          }}
        />
        <style>{`
          @keyframes drift1 {
            from { transform: translate(0, 0); }
            to   { transform: translate(40px, 30px); }
          }
          @keyframes drift2 {
            from { transform: translate(0, 0); }
            to   { transform: translate(-35px, -25px); }
          }
        `}</style>

        {/* Content layer */}
        <div className="relative z-10 flex flex-col min-h-screen px-6 md:px-12 lg:px-16">

          {/* Navbar */}
          <Navbar />

          {/* Header */}
          <div
            className="text-center pt-16 pb-12 max-w-3xl mx-auto"
            style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 text-[#d1e4fb]"
              style={{ letterSpacing: "-0.01em" }}
            >
              Transparent Pricing for Infinite Growth.
            </h1>
            <p className="text-base md:text-lg text-[#c4c7c8]">
              Deploy AI-driven automation that scales with your ambition.
              Choose a plan that fuels your store's velocity.
            </p>
          </div>

          {/* Pricing Tiers */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20 max-w-5xl mx-auto w-full"
            style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
          >
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`liquid-glass rounded-2xl p-8 flex flex-col relative transition-all duration-300 border ${
                  tier.highlighted
                    ? "border-white/30 md:-translate-y-2"
                    : "border-[#444748]"
                }`}
                style={{ background: tier.highlighted ? "#192b3d" : "#091d2e" }}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ffffff] text-[#2f3131] px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                    Most Popular
                  </div>
                )}

                <span className="text-xs uppercase tracking-widest text-[#c4c7c8] mb-3">
                  {tier.tag}
                </span>
                <h3 className="text-2xl font-medium text-[#d1e4fb] mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-semibold text-[#d1e4fb]">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-[#c4c7c8]">{tier.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((feature) => (
                    <li
                      key={feature.text}
                      className={`flex items-center gap-3 text-sm ${
                        feature.included ? "text-[#d1e4fb]" : "text-[#c4c7c8]/40"
                      }`}
                    >
                      {feature.included ? (
                        <Check className="w-4 h-4 text-[#ffffff] shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-[#c4c7c8]/40 shrink-0" />
                      )}
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                    tier.highlighted
                      ? "bg-[#ffffff] text-[#2f3131] hover:opacity-90"
                      : "bg-white/5 border border-white/10 text-[#d1e4fb] hover:bg-white/10"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
