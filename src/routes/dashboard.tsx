import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { ArrowRight, Store as StoreIcon, Package, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { useApproval } from "@/hooks/use-approval";
import { PendingApproval } from "@/components/PendingApproval";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

// Cream + black design system (shared with pricing/contact/stores)
const cream = "var(--mk-cream)";
const creamCard = "var(--mk-cream-card)";
const ink = "var(--mk-ink)";
const muted = "var(--mk-muted)";
const surface = "var(--mk-surface)";
const onAccent = "var(--mk-on-accent)";
const heading = "var(--font-heading)";
const body = "var(--font-body)";
const hairline = "var(--mk-hairline)";

const ease = [0.16, 1, 0.3, 1] as const;

function DashboardPage() {
  const { session, isLoading } = useSupabaseAuth();
  const { status: approvalStatus, isLoading: approvalLoading } = useApproval();
  const navigate = useNavigate();
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The dashboard is gated: signed-out visitors go back to the home hero.
  useEffect(() => {
    if (!isLoading && !session) void navigate({ to: "/" });
  }, [isLoading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    setStoreLoading(true);
    supabase
      .from("stores")
      .select("id")
      .eq("owner_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) void navigate({ to: "/store" });
        setStoreLoading(false);
      });
  }, [session]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !storeName.trim()) return;
    setCreating(true);
    setError(null);
    const { error } = await supabase.from("stores").insert({
      name: storeName.trim(),
      owner_id: session.user.id,
      owner_email: session.user.email,
    });
    if (error) {
      setError(error.message);
      setCreating(false);
    } else {
      void navigate({ to: "/store" });
    }
  };

  if (isLoading || !session || approvalLoading) return null;

  if (approvalStatus && approvalStatus !== "approved") {
    return <PendingApproval status={approvalStatus} />;
  }

  const emailPrefix = session.user.email?.split("@")[0] ?? "";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--mk-bg)", color: ink, fontFamily: body }}
    >
      <div className="px-6 md:px-12 lg:px-16">
        <Navbar variant="light" />
      </div>

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-16">
        {storeLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div
              className="w-5 h-5 rounded-full border-2 animate-spin"
              style={{ borderColor: "var(--mk-tint-strong)", borderTopColor: ink }}
            />
            <p className="text-sm" style={{ color: muted }}>
              Loading your store…
            </p>
          </div>
        ) : (
          <>
            {/* Hero */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="mb-14 max-w-3xl"
            >
              <p
                className="text-sm font-medium mb-4"
                style={{ fontFamily: body, color: muted }}
              >
                Welcome{emailPrefix ? `, ${emailPrefix}` : ""}
              </p>
              <h1
                className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight"
                style={{ fontFamily: heading, color: ink }}
              >
                Set up your store
              </h1>
              <p
                className="text-xl leading-relaxed max-w-2xl"
                style={{ color: muted }}
              >
                Give your store a name and it goes live on Swish — visible to
                every customer who searches. You can refine everything later.
              </p>
            </motion.section>

            {/* Bento grid */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.08 }}
                className="lg:col-span-7 rounded-xl p-8 md:p-12 relative overflow-hidden"
                style={{
                  background: surface,
                  boxShadow: `${hairline}, 0 8px 30px rgb(0 0 0 / 0.04)`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-7"
                  style={{ background: cream, boxShadow: hairline }}
                >
                  <StoreIcon className="w-5 h-5" style={{ color: ink }} />
                </div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: heading, color: ink }}
                >
                  Create your store
                </h2>
                <p className="text-sm mb-8" style={{ color: muted }}>
                  This is the name customers see in the Swish app.
                </p>

                <form className="space-y-6" onSubmit={handleCreateStore}>
                  <div className="space-y-2">
                    <label
                      htmlFor="store-name"
                      className="text-sm font-medium"
                      style={{ fontFamily: body, color: muted }}
                    >
                      Store name <span style={{ color: "#ba1a1a" }}>*</span>
                    </label>
                    <input
                      id="store-name"
                      type="text"
                      required
                      autoFocus
                      disabled={creating}
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Jordan's Kicks"
                      className="w-full rounded-lg px-4 py-3 outline-none transition-shadow focus:ring-1 focus:ring-black disabled:opacity-60"
                      style={{
                        background: creamCard,
                        color: ink,
                        fontFamily: body,
                        boxShadow: hairline,
                      }}
                    />
                    <p className="text-xs" style={{ color: muted }}>
                      You can change this later from your store settings.
                    </p>
                  </div>

                  {error && (
                    <p
                      className="text-sm rounded-lg px-4 py-3"
                      style={{
                        color: "#ba1a1a",
                        background: "rgba(186,26,26,0.08)",
                        boxShadow: "inset 0 0 0 1px rgba(186,26,26,0.2)",
                      }}
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={creating || !storeName.trim()}
                    className="group inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 rounded-full font-medium shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
                    style={{ fontFamily: body, color: onAccent, background: ink }}
                  >
                    {creating ? (
                      "Creating your store…"
                    ) : (
                      <>
                        Create store
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* Sidebar */}
              <div className="lg:col-span-5 flex flex-col gap-8">
                {/* What happens next */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.16 }}
                  className="rounded-xl p-8"
                  style={{ background: surface, boxShadow: hairline }}
                >
                  <h3
                    className="text-xl font-bold mb-6"
                    style={{ fontFamily: heading, color: ink }}
                  >
                    What happens next
                  </h3>
                  <ul className="space-y-6">
                    <Step
                      n={1}
                      icon={<StoreIcon className="w-4 h-4" style={{ color: ink }} />}
                      title="Name your store"
                      blurb="Pick a name customers will recognize. Live the moment you create it."
                    />
                    <Step
                      n={2}
                      icon={<Package className="w-4 h-4" style={{ color: ink }} />}
                      title="Add your items"
                      blurb="Upload products with photos, prices, and live stock counts."
                    />
                    <Step
                      n={3}
                      icon={<Rocket className="w-4 h-4" style={{ color: ink }} />}
                      title="Start selling"
                      blurb="Customers find you in the Swish app and shop your catalog."
                      last
                    />
                  </ul>
                </motion.div>

                {/* Accent card */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.24 }}
                  className="rounded-xl p-8 flex-grow relative overflow-hidden"
                  style={{ background: ink, color: onAccent }}
                >
                  <div
                    className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20"
                    style={{ background: cream }}
                    aria-hidden
                  />
                  <div className="relative z-10">
                    <Rocket className="w-6 h-6 mb-6" style={{ color: cream }} />
                    <h3
                      className="text-2xl font-bold mb-3 leading-tight"
                      style={{ fontFamily: heading }}
                    >
                      Live in minutes
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "color-mix(in srgb, var(--mk-on-accent) 70%, transparent)" }}
                    >
                      Setup takes less than 30 seconds. No credit card required —
                      just a name to get your storefront on Swish.
                    </p>
                  </div>
                </motion.div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        className="w-full py-16 border-t mt-auto"
        style={{ background: "var(--mk-bg)", borderColor: "var(--mk-border)" }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 lg:px-16 max-w-6xl mx-auto gap-8">
          <div
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: heading, color: "#2073FD" }}
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

function Step({
  n,
  icon,
  title,
  blurb,
  last,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  blurb: string;
  last?: boolean;
}) {
  return (
    <li className="flex items-start gap-4 relative">
      {/* Connector line */}
      {!last && (
        <span
          className="absolute left-5 top-11 bottom-[-1.5rem] w-px"
          style={{ background: "var(--mk-border)" }}
          aria-hidden
        />
      )}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative z-10"
        style={{ background: cream, boxShadow: hairline }}
      >
        {icon}
      </div>
      <div className="pt-0.5">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-bold tabular-nums"
            style={{ color: muted }}
          >
            {String(n).padStart(2, "0")}
          </span>
          <p
            className="text-sm font-semibold"
            style={{ fontFamily: heading, color: ink }}
          >
            {title}
          </p>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: muted }}>
          {blurb}
        </p>
      </div>
    </li>
  );
}
