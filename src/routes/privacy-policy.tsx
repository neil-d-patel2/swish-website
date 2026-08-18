import { createFileRoute } from "@tanstack/react-router";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Navbar } from "@/components/Navbar";
import policyMarkdown from "../../swish-privacy-policy.md?raw";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

// Same cream + black tokens the other marketing pages use.
const ink = "var(--mk-ink)";
const muted = "var(--mk-muted)";
const faint = "var(--mk-faint)";
const border = "var(--mk-border)";
const heading = "var(--font-heading)";
const body = "var(--font-body)";

function PrivacyPolicyPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--mk-bg)", color: ink, fontFamily: body }}
    >
      <Navbar />

      <main
        className="flex-grow w-full mx-auto px-6 md:px-12 py-20"
        style={{ maxWidth: 760 }}
      >
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1
                className="text-4xl md:text-5xl font-bold tracking-tight mb-8"
                style={{ fontFamily: heading, color: ink }}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                className="text-2xl font-bold tracking-tight mt-12 mb-6"
                style={{ fontFamily: heading, color: ink }}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                className="text-base font-semibold mt-10 mb-4"
                style={{ fontFamily: heading, color: ink }}
              >
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-5 leading-[1.75]" style={{ color: muted }}>
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul
                className="mb-5 space-y-3 pl-5 list-disc leading-[1.7]"
                style={{ color: muted }}
              >
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol
                className="mb-5 space-y-3 pl-5 list-decimal leading-[1.7]"
                style={{ color: muted }}
              >
                {children}
              </ol>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold" style={{ color: ink }}>
                {children}
              </strong>
            ),
            em: ({ children }) => <em style={{ color: muted }}>{children}</em>,
            a: ({ href, children }) => (
              <a
                href={href}
                className="mk-nlink underline underline-offset-2"
                style={{ color: ink }}
              >
                {children}
              </a>
            ),
            hr: () => (
              <hr className="my-12" style={{ borderTop: `1px solid ${border}` }} />
            ),
            // Wide policy tables scroll inside their own container so the page
            // body never scrolls horizontally.
            table: ({ children }) => (
              <div className="my-7 overflow-x-auto">
                <table
                  className="w-full border-collapse text-sm"
                  style={{ minWidth: 480 }}
                >
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th
                className="text-left font-medium py-2.5 pr-6 align-bottom"
                style={{ color: faint, borderBottom: `1px solid ${border}` }}
              >
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td
                className="py-3.5 pr-6 align-top leading-[1.6]"
                style={{ color: muted, borderBottom: `1px solid ${border}` }}
              >
                {children}
              </td>
            ),
          }}
        >
          {policyMarkdown}
        </Markdown>
      </main>

      {/* Footer */}
      <footer
        style={{
          background: "var(--mk-bg)",
          borderTop: "1px solid rgba(0,0,0,.06)",
          padding: "48px 28px",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 18,
              flexShrink: 0,
            }}
          >
            <img
              src="/your-logo.png"
              alt="Swish Logo"
              style={{ height: "100%", width: "auto", display: "block" }}
            />
          </div>
          <div style={{ fontSize: 13, color: "#71717a" }}>
            © 2026 Swish Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
