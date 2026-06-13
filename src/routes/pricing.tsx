import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { CheckCircle2, XCircle } from "lucide-react";

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
    <div className="min-h-screen" style={{ background: "#FDFBF7" }}>
      <div className="relative w-full min-h-screen flex flex-col">

        {/* Content layer */}
        <div className="relative z-10 flex flex-col min-h-screen px-6 md:px-12 lg:px-16">

          {/* Navbar */}
          <Navbar />

          {/* Header */}
          <div
            className="text-center pt-20 pb-16 max-w-3xl mx-auto"
            style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-black"
              style={{ letterSpacing: "-0.02em" }}
            >
              Transparent Pricing for Infinite Growth.
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              Deploy AI-driven automation that scales with your ambition.
              Choose a plan that fuels your store's velocity.
            </p>
          </div>

          {/* Pricing Tiers */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-24 max-w-5xl mx-auto w-full"
            style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
          >
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-white border border-gray-200 p-8 md:p-10 rounded-2xl flex flex-col transition-all duration-300 ${
                  tier.highlighted
                    ? "shadow-lg md:hover:-translate-y-2"
                    : "shadow-sm hover:border-gray-300"
                }`}
              >
                <span className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-4">
                  {tier.tag}
                </span>
                <h3 className="text-2xl md:text-3xl font-semibold text-black mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-bold text-black">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-gray-500">{tier.period}</span>
                  )}
                </div>

                <ul className="space-y-4 mb-10 flex-grow">
                  {tier.features.map((feature) => (
                    <li
                      key={feature.text}
                      className={`flex items-center gap-3 text-sm ${
                        feature.included ? "text-gray-800" : "text-gray-400"
                      }`}
                    >
                      {feature.included ? (
                        <CheckCircle2 className="w-5 h-5 text-black shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300 shrink-0" />
                      )}
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3.5 rounded-xl font-semibold transition-colors duration-200 cursor-pointer ${
                    tier.highlighted
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-white border border-gray-300 text-black hover:bg-gray-50"
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
