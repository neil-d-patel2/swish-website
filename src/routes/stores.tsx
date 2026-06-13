import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/stores")({
  component: StoresPage,
});

// Cream + black design system (shared with pricing/contact)
const cream = "#F6F1E7";
const ink = "#000000";
const muted = "rgba(0,0,0,0.6)";
const heading = "var(--font-heading)";
const body = "var(--font-body)";

function StoresPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: cream, color: ink, fontFamily: body }}
    >
      <div className="px-6 md:px-12 lg:px-16">
        <Navbar variant="light" />
      </div>

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-24">
        <h1
          className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6"
          style={{ fontFamily: heading, color: ink }}
        >
          Stores
        </h1>
        <p
          className="text-lg leading-relaxed max-w-2xl"
          style={{ color: muted }}
        >
          This page is coming soon.
        </p>
      </main>

      {/* Footer */}
      <footer
        className="w-full py-16 border-t mt-auto"
        style={{ background: "#ffffff", borderColor: "rgba(0,0,0,0.1)" }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 lg:px-16 max-w-6xl mx-auto gap-8">
          <div
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: heading, color: ink }}
          >
            Swish
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Security", "Status"].map(
              (l) => (
                <a
                  key={l}
                  href="#"
                  className="text-sm transition-opacity hover:opacity-60"
                  style={{ fontFamily: body, color: muted }}
                >
                  {l}
                </a>
              ),
            )}
          </div>
          <div className="text-sm" style={{ fontFamily: body, color: muted }}>
            © 2026 Swish Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
