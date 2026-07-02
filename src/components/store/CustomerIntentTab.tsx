import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { glass, glassCardStyle, glassCardSStyle } from "./glass-theme";

type IntentSummary = {
  itemsWishlisted: number;
  highIntentShoppers7d: number;
  followers: number;
  mostWishlisted: { name: string; count: number }[];
  signals: { text: string; badge: "HOT" | "MED"; createdAt: string }[];
  recovered30d: number | null;
  winBackRate: number | null;
};

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function CustomerIntentTab({
  storeId,
  ownerId,
}: {
  storeId: string;
  ownerId: string;
}) {
  const getIntentSummary = useAction(api.customerIntent.getIntentSummary);
  const [summary, setSummary] = useState<IntentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getIntentSummary({ storeId, ownerId })
      .then((res) => {
        if (!cancelled) setSummary(res);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storeId, ownerId, getIntentSummary]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div
          className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: "rgba(0,0,0,.12)", borderTopColor: glass.ink }}
        />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <p className="text-sm" style={{ color: glass.danger }}>
        {error ?? "Couldn't load customer intent."}
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <IntentStat
          label="Wishlisted"
          value={String(summary.itemsWishlisted)}
        />
        <IntentStat
          label="High-intent shoppers"
          value={String(summary.highIntentShoppers7d)}
          sub="last 7 days"
        />
        <IntentStat label="Store followers" value={String(summary.followers)} />
        <ComingSoonStat label="Win-back rate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-4">
        {/* Most wishlisted */}
        <div style={{ ...glassCardStyle, padding: "20px 22px" }}>
          <div
            className="text-sm font-semibold mb-3.5"
            style={{ color: glass.ink }}
          >
            Most wishlisted
          </div>
          {summary.mostWishlisted.length === 0 ? (
            <p className="text-xs" style={{ color: glass.muted }}>
              No wishlist activity yet.
            </p>
          ) : (
            summary.mostWishlisted.map((w, i) => (
              <div
                key={w.name + i}
                className="flex items-center gap-3 py-2.5"
                style={
                  i > 0 ? { borderTop: `1px solid ${glass.border}` } : undefined
                }
              >
                <span
                  className="text-xs flex-1 truncate"
                  style={{ color: glass.ink }}
                >
                  {w.name}
                </span>
                <span
                  className="text-xs font-semibold tabular-nums"
                  style={{ color: glass.ink }}
                >
                  {w.count}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Live signals */}
        <div style={{ ...glassCardStyle, padding: "20px 22px" }}>
          <div className="flex items-center justify-between mb-3.5">
            <span
              className="text-sm font-semibold"
              style={{ color: glass.ink }}
            >
              Live intent signals
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: glass.accent }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: glass.accent }}
              />
              live
            </span>
          </div>
          {summary.signals.length === 0 ? (
            <p className="text-xs" style={{ color: glass.muted }}>
              No recent activity yet.
            </p>
          ) : (
            summary.signals.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 py-2.5"
                style={
                  i > 0 ? { borderTop: `1px solid ${glass.border}` } : undefined
                }
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: s.badge === "HOT" ? glass.accent : glass.faint,
                  }}
                />
                <span
                  className="text-xs flex-1 truncate"
                  style={{ color: "#3f3f46" }}
                >
                  {s.text}
                </span>
                <span
                  className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    background:
                      s.badge === "HOT" ? glass.accent : "rgba(0,0,0,.06)",
                    color: s.badge === "HOT" ? "#fff" : glass.muted,
                  }}
                >
                  {s.badge}
                </span>
                <span
                  className="text-[11px] shrink-0"
                  style={{ color: glass.faint }}
                >
                  {relativeTime(s.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {summary.recovered30d === null && (
        <div
          style={{ ...glassCardSStyle, padding: "14px 18px" }}
          className="mt-4"
        >
          <p className="text-xs" style={{ color: glass.muted }}>
            Recovered revenue and win-back rate need purchase data linked to
            wishlist activity — coming soon once that connection exists.
          </p>
        </div>
      )}
    </div>
  );
}

function IntentStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div style={{ ...glassCardStyle, padding: "18px 20px" }}>
      <div
        className="text-[11px] uppercase tracking-wider font-medium mb-2"
        style={{ color: glass.muted }}
      >
        {label}
      </div>
      <div
        className="text-3xl font-bold tabular-nums"
        style={{ color: glass.ink }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] mt-1" style={{ color: glass.muted }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function ComingSoonStat({ label }: { label: string }) {
  return (
    <div style={{ ...glassCardStyle, padding: "18px 20px" }}>
      <div
        className="text-[11px] uppercase tracking-wider font-medium mb-2"
        style={{ color: glass.muted }}
      >
        {label}
      </div>
      <div className="text-sm font-medium" style={{ color: glass.faint }}>
        Coming soon
      </div>
    </div>
  );
}
