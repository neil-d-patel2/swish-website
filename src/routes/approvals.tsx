import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Check, X, ShieldCheck, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { ADMIN_EMAIL, type ApprovalStatus } from "@/hooks/use-approval";
import { Navbar } from "@/components/Navbar";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/approvals")({
  component: ApprovalsPage,
});

const ink = "var(--mk-ink)";
const muted = "var(--mk-muted)";
const surface = "var(--mk-surface)";
const onAccent = "var(--mk-on-accent)";
const heading = "var(--font-heading)";
const body = "var(--font-body)";
const hairline = "var(--mk-hairline)";

type Approval = {
  id: string;
  email: string | null;
  status: ApprovalStatus;
  requested_at: string;
  decided_at: string | null;
};

const STATUS_RANK: Record<ApprovalStatus, number> = {
  pending: 0,
  approved: 1,
  denied: 2,
};

function ApprovalsPage() {
  const { session, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user.email?.toLowerCase() === ADMIN_EMAIL;

  // Signed-out or non-owner visitors are sent back to the home hero.
  useEffect(() => {
    if (!isLoading && !isAdmin) void navigate({ to: "/" });
  }, [isLoading, isAdmin, navigate]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("user_approvals")
      .select("id, email, status, requested_at, decided_at")
      .order("requested_at", { ascending: false });
    const sorted = ((data ?? []) as Approval[]).slice().sort((a, b) => {
      const r = STATUS_RANK[a.status] - STATUS_RANK[b.status];
      return r !== 0 ? r : b.requested_at.localeCompare(a.requested_at);
    });
    setRows(sorted);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  const decide = async (id: string, status: ApprovalStatus) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    const { error } = await supabase
      .from("user_approvals")
      .update({ status, decided_at: new Date().toISOString() })
      .eq("id", id);
    if (error) void load(); // revert to server truth on failure
  };

  if (isLoading || !isAdmin) return null;

  const pendingCount = rows.filter((r) => r.status === "pending").length;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--mk-bg)", color: ink, fontFamily: body }}
    >
      <Navbar />

      <main className="flex-grow w-full max-w-3xl mx-auto px-6 md:px-12 lg:px-16 py-16">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-6 w-6" style={{ color: ink }} />
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight"
            style={{ fontFamily: heading, color: ink }}
          >
            Store access requests
          </h1>
        </div>
        <p className="text-base mb-10" style={{ color: muted }}>
          {pendingCount > 0
            ? `${pendingCount} request${pendingCount === 1 ? "" : "s"} awaiting your review.`
            : "No requests are waiting on you right now."}
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="w-5 h-5 rounded-full border-2 animate-spin"
              style={{
                borderColor: "var(--mk-tint-strong)",
                borderTopColor: ink,
              }}
            />
          </div>
        ) : rows.length === 0 ? (
          <p style={{ color: muted }}>No one has signed up yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4"
                style={{ background: surface, boxShadow: hairline }}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold" style={{ color: ink }}>
                    {r.email ?? r.id}
                  </p>
                  <p className="text-sm" style={{ color: muted }}>
                    {new Date(r.requested_at).toLocaleDateString()} ·{" "}
                    <StatusBadge status={r.status} />
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {r.status !== "approved" && (
                    <button
                      onClick={() => void decide(r.id, "approved")}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-transform active:scale-[0.98]"
                      style={{ color: onAccent, background: ink }}
                    >
                      <Check className="h-4 w-4" /> Approve
                    </button>
                  )}
                  {r.status !== "denied" && (
                    <button
                      onClick={() => void decide(r.id, "denied")}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                      style={{ color: ink, boxShadow: hairline }}
                    >
                      <X className="h-4 w-4" /> Deny
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <SendNotificationSection />
      </main>
    </div>
  );
}

type StoreOption = { id: string; name: string; owner_email: string };

const NOTIFICATION_TYPES: { value: string; label: string }[] = [
  { value: "recommendation", label: "Recommendation" },
  { value: "high_intent_item", label: "High-intent item" },
  { value: "high_intent_customer", label: "High-intent customer" },
  { value: "stocking_idea", label: "Stocking idea" },
  { value: "marketing", label: "Marketing idea" },
  { value: "general", label: "General update" },
];

function SendNotificationSection() {
  const send = useAction(api.storeNotifications.send);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [storeId, setStoreId] = useState("");
  const [type, setType] = useState(NOTIFICATION_TYPES[0].value);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    void supabase
      .from("stores")
      .select("id, name, owner_email")
      .order("name", { ascending: true })
      .then(({ data }) => setStores((data ?? []) as StoreOption[]));
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !title.trim() || !body.trim()) return;
    setStatus("sending");
    setErrorMsg(null);
    try {
      await send({
        storeId,
        type: type as
          | "recommendation"
          | "high_intent_item"
          | "high_intent_customer"
          | "stocking_idea"
          | "marketing"
          | "general",
        title: title.trim(),
        body: body.trim(),
        ctaLabel: ctaLabel.trim() || undefined,
        ctaUrl: ctaUrl.trim() || undefined,
        sendEmail,
      });
      setStatus("done");
      setTitle("");
      setBody("");
      setCtaLabel("");
      setCtaUrl("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to send.");
      setStatus("error");
    }
  };

  return (
    <div
      className="mt-16 pt-10"
      style={{ borderTop: "1px solid rgba(0,0,0,.06)" }}
    >
      <div className="flex items-center gap-3 mb-2">
        <Send className="h-5 w-5" style={{ color: ink }} />
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: heading, color: ink }}
        >
          Send a notification
        </h2>
      </div>
      <p className="text-sm mb-8" style={{ color: muted }}>
        Push a recommendation or update to a store's dashboard, optionally with
        an email.
      </p>

      <form onSubmit={(e) => void handleSend(e)} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className="text-sm font-medium mb-1.5 block"
              style={{ color: muted }}
            >
              Store
            </label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: surface, color: ink, boxShadow: hairline }}
            >
              <option value="">Select a store…</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.owner_email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="text-sm font-medium mb-1.5 block"
              style={{ color: muted }}
            >
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: surface, color: ink, boxShadow: hairline }}
            >
              {NOTIFICATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            className="text-sm font-medium mb-1.5 block"
            style={{ color: muted }}
          >
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Restock suggestion: Air Force 1"
            required
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: surface, color: ink, boxShadow: hairline }}
          />
        </div>

        <div>
          <label
            className="text-sm font-medium mb-1.5 block"
            style={{ color: muted }}
          >
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={5}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-y"
            style={{ background: surface, color: ink, boxShadow: hairline }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className="text-sm font-medium mb-1.5 block"
              style={{ color: muted }}
            >
              CTA label (optional)
            </label>
            <input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="e.g. View item"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: surface, color: ink, boxShadow: hairline }}
            />
          </div>
          <div>
            <label
              className="text-sm font-medium mb-1.5 block"
              style={{ color: muted }}
            >
              CTA URL (optional)
            </label>
            <input
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: surface, color: ink, boxShadow: hairline }}
            />
          </div>
        </div>

        <label
          className="flex items-center gap-2 text-sm"
          style={{ color: muted }}
        >
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
          />
          Also email the store owner (they can opt out from their dashboard)
        </label>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={
              status === "sending" || !storeId || !title.trim() || !body.trim()
            }
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-50"
            style={{ color: onAccent, background: ink }}
          >
            <Send className="w-4 h-4" />
            {status === "sending" ? "Sending…" : "Send notification"}
          </button>
          {status === "done" && (
            <p className="text-sm" style={{ color: "#15803d" }}>
              Sent.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm" style={{ color: "#ba1a1a" }}>
              {errorMsg ?? "Failed to send."}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const label =
    status === "approved"
      ? "Approved"
      : status === "denied"
        ? "Denied"
        : "Pending";
  return <span style={{ textTransform: "capitalize" }}>{label}</span>;
}
