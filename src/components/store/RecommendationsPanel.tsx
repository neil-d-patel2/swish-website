import { useEffect, useState, useCallback } from "react";
import {
  Lightbulb,
  TrendingUp,
  Users,
  Package,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { glass, glassCardStyle, glassCardSStyle } from "./glass-theme";

const ink = glass.ink;
const muted = glass.muted;
const heading = "Geist, system-ui, sans-serif";
const body = "Geist, system-ui, sans-serif";

type NotificationType =
  | "recommendation"
  | "high_intent_item"
  | "high_intent_customer"
  | "stocking_idea"
  | "marketing"
  | "general";

type StoreNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  cta_label: string | null;
  cta_url: string | null;
  read_at: string | null;
  created_at: string;
};

const TYPE_META: Record<
  NotificationType,
  { label: string; icon: typeof Lightbulb }
> = {
  recommendation: { label: "Recommendation", icon: Lightbulb },
  high_intent_item: { label: "High-intent item", icon: Package },
  high_intent_customer: { label: "High-intent customer", icon: Users },
  stocking_idea: { label: "Stocking idea", icon: TrendingUp },
  marketing: { label: "Marketing idea", icon: Megaphone },
  general: { label: "Update", icon: Sparkles },
};

export function RecommendationsPanel({ storeId }: { storeId: string }) {
  const [items, setItems] = useState<StoreNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("store_notifications")
      .select("id,type,title,body,cta_label,cta_url,read_at,created_at")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })
      .limit(20);
    setItems((data ?? []) as StoreNotification[]);
    setLoading(false);
  }, [storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (id: string) => {
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
      ),
    );
    await supabase
      .from("store_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
  };

  const unreadCount = items.filter((n) => !n.read_at).length;

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: heading, color: ink }}
        >
          Recommendations
        </h2>
        {unreadCount > 0 && (
          <span
            className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ background: glass.accentTint, color: glass.accent }}
          >
            {unreadCount} new
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div
            className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{ borderColor: "rgba(0,0,0,.12)", borderTopColor: ink }}
          />
        </div>
      ) : items.length === 0 ? (
        <div
          className="flex flex-col items-center text-center"
          style={{ ...glassCardSStyle, padding: "48px 32px" }}
        >
          <Lightbulb className="w-6 h-6 mb-3" style={{ color: muted }} />
          <p className="text-sm max-w-sm" style={{ color: muted }}>
            High-intent items, stocking ideas, and marketing recommendations
            from the Swish team will show up here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((n) => {
            const meta = TYPE_META[n.type];
            const Icon = meta.icon;
            return (
              <li
                key={n.id}
                className="flex items-start gap-4"
                style={{
                  ...glassCardStyle,
                  padding: 20,
                  boxShadow: n.read_at
                    ? glassCardStyle.boxShadow
                    : `${glassCardStyle.boxShadow}, 0 0 0 1.5px ${glass.accent}`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(255,255,255,.5)",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)",
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: ink }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wide"
                      style={{ color: muted }}
                    >
                      {meta.label}
                    </span>
                    <span className="text-[11px]" style={{ color: muted }}>
                      · {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p
                    className="font-semibold mb-1"
                    style={{ color: ink, fontFamily: body }}
                  >
                    {n.title}
                  </p>
                  <p
                    className="text-sm mb-2 whitespace-pre-wrap"
                    style={{ color: muted }}
                  >
                    {n.body}
                  </p>
                  <div className="flex items-center gap-4 flex-wrap">
                    {n.cta_url && n.cta_label && (
                      <a
                        href={n.cta_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium underline"
                        style={{ color: ink }}
                      >
                        {n.cta_label}
                      </a>
                    )}
                    {!n.read_at && (
                      <button
                        onClick={() => void markRead(n.id)}
                        className="text-xs cursor-pointer"
                        style={{ color: muted }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
