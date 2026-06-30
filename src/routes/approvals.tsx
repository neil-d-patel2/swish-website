import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Check, X, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { ADMIN_EMAIL, type ApprovalStatus } from "@/hooks/use-approval";
import { Navbar } from "@/components/Navbar";

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
      </main>
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
