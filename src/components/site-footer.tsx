import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

// Shared marketing footer. Echoes the home hero: white canvas, pure-black
// "Swish ✳︎" wordmark, hairline borders, muted links that fade on hover.
const ink = "var(--mk-ink)";
const muted = "var(--mk-muted)";
const faint = "var(--mk-faint)";
const surface = "var(--mk-surface)";
const heading = "var(--font-heading)";
const body = "var(--font-body)";

const CONTACT_EMAIL = "swishappdev@gmail.com";

const columns: { title: string; links: { label: string; to?: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Home", to: "/" },
      { label: "Pricing", to: "/pricing" },
      { label: "Stores", to: "/stores" },
      { label: "Waitlist", to: "/waitlist" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "About" },
      { label: "Careers" },
      { label: "Blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy" },
      { label: "Terms of Service" },
      { label: "Security" },
      { label: "Status" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer
      className="w-full mt-24 border-t"
      style={{
        background: surface,
        borderColor: "var(--mk-border)",
        fontFamily: body,
      }}
    >
      <div className="w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand block */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <span
                className="text-2xl tracking-tight"
                style={{ fontFamily: heading, color: "#2073FD" }}
              >
                Swish
              </span>
              <span
                className="text-2xl transition-transform duration-500 group-hover:rotate-90"
                style={{ color: ink, letterSpacing: "-0.02em" }}
                aria-hidden
              >
                ✳︎
              </span>
            </Link>
            <p
              className="mt-5 text-sm leading-relaxed max-w-xs"
              style={{ color: muted }}
            >
              The AI platform built for small business. Even the odds — launch,
              automate, and grow in minutes.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-60"
              style={{ color: ink }}
            >
              {CONTACT_EMAIL}
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h3
                className="text-xs font-semibold uppercase tracking-[0.16em] mb-4"
                style={{ color: faint }}
              >
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-sm transition-opacity hover:opacity-60"
                        style={{ color: muted }}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href="#"
                        className="text-sm transition-opacity hover:opacity-60"
                        style={{ color: muted }}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t"
          style={{ borderColor: "var(--mk-border)" }}
        >
          <p className="text-xs" style={{ color: faint }}>
            © 2026 Swish Inc. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: faint }}>
            Built for the ones evening the odds.
          </p>
        </div>
      </div>
    </footer>
  );
}
