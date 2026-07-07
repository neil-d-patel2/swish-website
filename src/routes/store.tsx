import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Upload,
  Plus,
  Package,
  ImageIcon,
  Trash2,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useApproval } from "@/hooks/use-approval";
import { PendingApproval } from "@/components/PendingApproval";
import { Navbar } from "@/components/Navbar";
import { PosIntegrations } from "@/components/store/PosIntegrations";
import { RecommendationsPanel } from "@/components/store/RecommendationsPanel";
import { CustomerIntentTab } from "@/components/store/CustomerIntentTab";
import {
  glass,
  glassCardStyle,
  glassCardSStyle,
  pillBtnClass,
  inkBtnStyle,
  outlineBtnStyle,
  fieldStyle,
} from "@/components/store/glass-theme";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/store")({
  component: StorePage,
});

type Tab = "overview" | "intent" | "inventory" | "insights" | "settings";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "intent", label: "Customer Intent" },
  { key: "inventory", label: "Inventory" },
  { key: "insights", label: "Insights" },
  { key: "settings", label: "Settings" },
];

type Store = {
  id: string;
  name: string;
  owner_email: string;
  created_at: string;
  plan: string;
  stripe_subscription_id: string | null;
  notify_email: boolean;
};

type Item = {
  id: string;
  store_id: string;
  store_email: string | null;
  store_name: string | null;
  name: string;
  price: number | null;
  stock: number;
  image_url: string | null;
  created_at: string;
};

type PosProvider = "shopify" | "square";
type PosConn = {
  provider: PosProvider;
  status: "connected" | "disconnected" | "error";
  external_account: string | null;
};

const PROVIDER_LABEL: Record<PosProvider, string> = {
  shopify: "Shopify",
  square: "Square",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")
  ).toUpperCase();
}

function itemStatus(stock: number) {
  if (stock <= 0)
    return { label: "Out", color: glass.danger, bg: glass.dangerTint };
  if (stock <= 5)
    return { label: "Low", color: glass.warn, bg: glass.warnTint };
  return { label: "In stock", color: glass.good, bg: glass.goodTint };
}

// Splits one CSV line, honoring double-quoted fields (POS exports often
// quote product names containing commas).
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

const CSV_FIELD_HINTS = {
  name: ["name", "title", "product", "item", "description"],
  price: ["price", "amount", "cost", "retail"],
  stock: ["stock", "qty", "quantity", "inventory", "on hand", "count"],
};

function guessCsvColumn(headers: string[], hints: string[]) {
  return headers.findIndex((h) =>
    hints.some((hint) => h.toLowerCase().includes(hint)),
  );
}

type CsvPending = {
  fileName: string;
  headers: string[];
  rows: string[][];
};

function StorePage() {
  const { session, isLoading } = useSupabaseAuth();
  const { status: approvalStatus, isLoading: approvalLoading } = useApproval();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvPending, setCsvPending] = useState<CsvPending | null>(null);
  const csvRef = useRef<HTMLInputElement>(null);
  const fulfillCheckoutAction = useAction(api.stripe.fulfillCheckout);
  const cancelSubscriptionAction = useAction(api.stripe.cancelSubscription);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const checkoutFulfilledRef = useRef(false);
  const [sales30d, setSales30d] = useState(0);
  const [posBanner, setPosBanner] = useState<string | null>(null);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyEmailSaving, setNotifyEmailSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [posConnections, setPosConnections] = useState<PosConn[]>([]);
  const [posQuickSyncing, setPosQuickSyncing] = useState(false);
  const shopifySyncNow = useAction(api.posShopify.syncNow);
  const squareSyncNow = useAction(api.posSquare.syncNow);

  const loadPosConnections = useCallback(async (storeId: string) => {
    const { data } = await supabase
      .from("pos_connections")
      .select("provider,status,external_account")
      .eq("store_id", storeId);
    setPosConnections((data ?? []) as PosConn[]);
  }, []);

  const handleQuickSync = async () => {
    if (!store || !session) return;
    setPosQuickSyncing(true);
    try {
      await Promise.all(
        posConnections
          .filter((c) => c.status === "connected")
          .map((c) =>
            c.provider === "shopify"
              ? shopifySyncNow({ storeId: store.id, ownerId: session.user.id })
              : squareSyncNow({ storeId: store.id, ownerId: session.user.id }),
          ),
      );
    } catch {
      // Per-provider errors surface on the Inventory tab's POS cards; this
      // header shortcut is best-effort.
    } finally {
      await loadPosConnections(store.id);
      setPosQuickSyncing(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      void navigate({ to: "/dashboard" });
      return;
    }

    supabase
      .from("stores")
      .select("*")
      .eq("owner_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          void navigate({ to: "/dashboard" });
          return;
        }
        setStore(data);
        setNotifyEmail(data.notify_email ?? true);
        setStoreLoading(false);
        void loadPosConnections(data.id);
        // Load items for this store
        supabase
          .from("items")
          .select("*")
          .eq("store_id", data.id)
          .order("created_at", { ascending: false })
          .then(({ data: itemData }) => setItems(itemData ?? []));
        // Sum sales from the last 30 days (populated by POS sync)
        const since = new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString();
        supabase
          .from("sales")
          .select("total_price")
          .eq("store_id", data.id)
          .gte("sold_at", since)
          .then(({ data: saleData }) => {
            const total = (saleData ?? []).reduce(
              (sum, s) => sum + (Number(s.total_price) || 0),
              0,
            );
            setSales30d(total);
          });
      });
  }, [session, isLoading]);

  // After an OAuth connect redirect (?pos=shopify_connected|square_connected|error)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pos = params.get("pos");
    if (!pos) return;
    setPosBanner(
      pos === "error"
        ? "Something went wrong connecting your POS. Please try again."
        : `${pos === "shopify_connected" ? "Shopify" : "Square"} connected — syncing your catalog now.`,
    );
    params.delete("pos");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState({}, "", next);
  }, []);

  const handleNotifyEmailToggle = async () => {
    if (!store) return;
    const next = !notifyEmail;
    setNotifyEmail(next);
    setNotifyEmailSaving(true);
    await supabase
      .from("stores")
      .update({ notify_email: next })
      .eq("id", store.id);
    setNotifyEmailSaving(false);
  };

  // On checkout success, fulfill the plan immediately via the Stripe session ID.
  // Runs once after the store first loads (so it doesn't race the initial fetch).
  useEffect(() => {
    if (!store || !session || checkoutFulfilledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (params.get("checkout") !== "success" || !sessionId) return;
    checkoutFulfilledRef.current = true;

    void (async () => {
      const plan = await fulfillCheckoutAction({
        sessionId,
        userId: session.user.id,
      });
      if (!plan) return;
      // Re-fetch so all columns (customer_id, subscription_id) are fresh
      const { data } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", session.user.id)
        .maybeSingle();
      if (data) setStore(data as Store);
    })();
  }, [store]);

  const handleItemAdded = (item: Item) => {
    setItems((prev) => [item, ...prev]);
    setDialogOpen(false);
  };

  const handleDeleteItem = async (id: string) => {
    await supabase.from("items").delete().eq("id", id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !store) return;

    setCsvError(null);

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());

    if (lines.length < 2) {
      setCsvError("CSV has no data rows.");
      return;
    }

    // Open the column-mapping dialog; the insert happens there.
    setCsvPending({
      fileName: file.name,
      headers: parseCsvLine(lines[0]),
      rows: lines.slice(1).map(parseCsvLine),
    });
  };

  const handleCancelPlan = async () => {
    if (!session) return;
    setCanceling(true);
    try {
      await cancelSubscriptionAction({ userId: session.user.id });
      setStore((prev) =>
        prev ? { ...prev, plan: "free", stripe_subscription_id: null } : prev,
      );
      setCancelConfirm(false);
    } catch {
      // leave confirm open so user can retry
    } finally {
      setCanceling(false);
    }
  };

  const totalValue = items.reduce(
    (sum, i) => sum + (i.price ?? 0) * i.stock,
    0,
  );
  const lowStockCount = items.filter((i) => i.stock > 0 && i.stock <= 5).length;

  if (isLoading || storeLoading || approvalLoading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ background: glass.frameBg }}
      >
        <div
          className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: "rgba(0,0,0,.12)", borderTopColor: glass.ink }}
        />
      </div>
    );
  }

  if (approvalStatus && approvalStatus !== "approved") {
    return <PendingApproval status={approvalStatus} />;
  }

  if (!store || !session) return null;

  return (
    <div
      className="min-h-screen"
      style={{
        background: glass.frameBg,
        color: glass.ink,
        fontFamily: "Geist, system-ui, sans-serif",
      }}
    >
      <Navbar />
      <main className="w-full max-w-6xl mx-auto px-6 md:px-10 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-sm font-semibold"
              style={{ background: glass.ink, color: "#fff" }}
            >
              {initials(store.name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xl font-semibold tracking-tight truncate"
                  style={{ color: glass.ink }}
                >
                  {store.name}
                </span>
                <Badge color={glass.good} bg={glass.goodTint} dot>
                  Online
                </Badge>
                <Badge color={glass.muted} bg="rgba(0,0,0,.05)">
                  {store.plan === "free"
                    ? "Free plan"
                    : `${store.plan.charAt(0).toUpperCase()}${store.plan.slice(1)} plan`}
                </Badge>
                {posConnections
                  .filter((c) => c.status !== "disconnected")
                  .map((c) => (
                    <Badge
                      key={c.provider}
                      color={c.status === "error" ? glass.danger : glass.accent}
                      bg={
                        c.status === "error"
                          ? glass.dangerTint
                          : glass.accentTint
                      }
                    >
                      POS: {PROVIDER_LABEL[c.provider]}
                      {c.status === "error" ? " sync error" : " synced"}
                    </Badge>
                  ))}
                {posConnections.some((c) => c.status === "connected") && (
                  <button
                    onClick={() => void handleQuickSync()}
                    disabled={posQuickSyncing}
                    aria-label="Sync POS now"
                    title="Sync POS now"
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full cursor-pointer disabled:opacity-50 shrink-0"
                    style={{
                      background: "rgba(0,0,0,.05)",
                      color: glass.muted,
                    }}
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${posQuickSyncing ? "animate-spin" : ""}`}
                    />
                  </button>
                )}
              </div>
              <p
                className="text-xs mt-0.5 truncate"
                style={{ color: glass.muted }}
              >
                {store.owner_email}
              </p>
            </div>
          </div>
          <button
            className={`${pillBtnClass} px-4 py-2 text-sm`}
            style={inkBtnStyle}
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add item
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mt-5 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`${pillBtnClass} px-4 py-2 text-sm whitespace-nowrap`}
              style={
                tab === t.key
                  ? { background: glass.ink, color: "#fff" }
                  : { background: "transparent", color: glass.muted }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
        <div
          style={{
            height: 1,
            background: glass.border,
            marginTop: 12,
            marginBottom: 22,
          }}
        />

        {posBanner && (
          <div
            className="flex items-center justify-between gap-4 rounded-2xl px-5 py-3.5 mb-6 text-sm"
            style={{ ...glassCardSStyle, color: glass.ink }}
          >
            <span>{posBanner}</span>
            <button
              onClick={() => setPosBanner(null)}
              className="text-xs font-medium cursor-pointer shrink-0"
              style={{ color: glass.muted }}
            >
              Dismiss
            </button>
          </div>
        )}

        {tab === "overview" && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 mb-4">
              <div style={{ ...glassCardStyle, padding: "20px 22px" }}>
                <span
                  className="text-[11px] uppercase tracking-wider font-medium"
                  style={{ color: glass.muted }}
                >
                  Sales · last 30 days
                </span>
                <div
                  className="text-3xl font-bold tabular-nums mt-2"
                  style={{ color: glass.ink }}
                >
                  ${sales30d.toFixed(2)}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <MiniStat label="Total items" value={String(items.length)} />
                <MiniStat
                  label="Inventory value"
                  value={`$${totalValue.toFixed(2)}`}
                />
                <MiniStat
                  label="Low stock"
                  value={lowStockCount > 0 ? `${lowStockCount} items` : "None"}
                  warn={lowStockCount > 0}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TeaserCard
                title="Customer intent"
                body="See wishlist activity, high-intent shoppers, and live signals for your store."
                cta="Open intent →"
                onClick={() => setTab("intent")}
              />
              <TeaserCard
                title="Swish insights"
                body="Recommendations and updates from the Swish team."
                cta="View all →"
                onClick={() => setTab("insights")}
              />
            </div>
          </div>
        )}

        {tab === "intent" && (
          <CustomerIntentTab storeId={store.id} ownerId={session.user.id} />
        )}

        {tab === "inventory" && (
          <div>
            <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
              <div>
                <span
                  className="text-lg font-bold"
                  style={{ color: glass.ink }}
                >
                  Inventory
                </span>
                <span className="text-xs ml-2.5" style={{ color: glass.muted }}>
                  {items.length} items · ${totalValue.toFixed(2)} value
                </span>
              </div>
              {items.length > 0 && (
                <div className="flex gap-2.5">
                  <button
                    className={`${pillBtnClass} px-3.5 py-2 text-xs`}
                    style={outlineBtnStyle}
                    onClick={() => csvRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Import CSV
                  </button>
                  <button
                    className={`${pillBtnClass} px-3.5 py-2 text-xs`}
                    style={inkBtnStyle}
                    onClick={() => setDialogOpen(true)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add item
                  </button>
                </div>
              )}
            </div>

            {csvError && (
              <p
                className="text-sm rounded-lg px-4 py-3 mb-4"
                style={{ color: glass.danger, background: glass.dangerTint }}
              >
                {csvError}
              </p>
            )}

            {items.length === 0 ? (
              <div
                style={{ ...glassCardStyle, padding: "60px 32px" }}
                className="flex flex-col items-center text-center"
              >
                <Package
                  className="w-6 h-6 mb-4"
                  style={{ color: glass.muted }}
                />
                <h3
                  className="text-lg font-bold mb-1.5"
                  style={{ color: glass.ink }}
                >
                  No items yet
                </h3>
                <p
                  className="text-sm max-w-xs mb-6"
                  style={{ color: glass.muted }}
                >
                  Add items individually, import a CSV, or connect a POS below.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    className={`${pillBtnClass} px-4 py-2.5 text-sm`}
                    style={outlineBtnStyle}
                    onClick={() => csvRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Import CSV
                  </button>
                  <button
                    className={`${pillBtnClass} px-4 py-2.5 text-sm`}
                    style={inkBtnStyle}
                    onClick={() => setDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add item
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{ ...glassCardStyle, padding: 0, overflow: "hidden" }}
              >
                <div
                  className="grid px-4 py-2.5 text-[10.5px] uppercase tracking-wider font-semibold"
                  style={{
                    gridTemplateColumns: "1fr 90px 80px 100px 36px",
                    color: glass.muted,
                    background: "rgba(0,0,0,.03)",
                  }}
                >
                  <span>Item</span>
                  <span className="text-right">Price</span>
                  <span className="text-right">Stock</span>
                  <span className="text-right">Status</span>
                  <span />
                </div>
                {items.map((item, i) => {
                  const status = itemStatus(item.stock);
                  return (
                    <div
                      key={item.id}
                      className="grid items-center px-4 py-2.5"
                      style={{
                        gridTemplateColumns: "1fr 90px 80px 100px 36px",
                        borderTop:
                          i > 0 ? `1px solid ${glass.border}` : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-semibold"
                            style={{
                              background: glass.accentTint,
                              color: glass.accent,
                            }}
                          >
                            {initials(item.name)}
                          </div>
                        )}
                        <span
                          className="text-xs font-medium truncate"
                          style={{ color: glass.ink }}
                        >
                          {item.name}
                        </span>
                      </div>
                      <div
                        className="text-right text-xs font-medium tabular-nums"
                        style={{ color: glass.ink }}
                      >
                        {item.price != null ? `$${item.price.toFixed(2)}` : "—"}
                      </div>
                      <div
                        className="text-right text-xs tabular-nums"
                        style={{ color: status.color }}
                      >
                        {item.stock}
                      </div>
                      <div className="text-right">
                        <span
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: status.bg, color: status.color }}
                        >
                          {status.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          aria-label={`Delete ${item.name}`}
                          className="inline-flex items-center justify-center rounded-md p-1 cursor-pointer"
                          style={{ color: glass.faint }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6">
              <PosIntegrations storeId={store.id} ownerId={session.user.id} />
            </div>
          </div>
        )}

        {tab === "insights" && <RecommendationsPanel storeId={store.id} />}

        {tab === "settings" && (
          <div className="max-w-2xl flex flex-col gap-4">
            <div style={{ ...glassCardStyle, padding: "22px 24px" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: glass.ink }}
                  >
                    Plan &amp; billing
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: glass.muted }}
                  >
                    You're on the{" "}
                    <span
                      className="font-semibold"
                      style={{ color: glass.ink }}
                    >
                      {store.plan === "free"
                        ? "Free"
                        : `${store.plan.charAt(0).toUpperCase()}${store.plan.slice(1)}`}{" "}
                      plan
                    </span>
                  </div>
                </div>
                {store.plan !== "free" && (
                  <>
                    {!cancelConfirm ? (
                      <button
                        onClick={() => setCancelConfirm(true)}
                        className="text-xs cursor-pointer"
                        style={{ color: glass.muted }}
                      >
                        Cancel plan
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => void handleCancelPlan()}
                          disabled={canceling}
                          className="text-xs font-semibold cursor-pointer disabled:opacity-50"
                          style={{ color: glass.danger }}
                        >
                          {canceling ? "Canceling…" : "Yes, cancel"}
                        </button>
                        <button
                          onClick={() => setCancelConfirm(false)}
                          className="text-xs cursor-pointer"
                          style={{ color: glass.muted }}
                        >
                          Never mind
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              {store.plan === "free" && (
                <div
                  className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
                  style={{ background: glass.accentTint }}
                >
                  <div>
                    <div
                      className="text-sm font-semibold mb-0.5"
                      style={{ color: glass.ink }}
                    >
                      Start your 14-day free trial
                    </div>
                    <div className="text-xs" style={{ color: "#52525b" }}>
                      Unlock AI automation, advanced analytics, and priority
                      support — no credit card charged until day 15.
                    </div>
                  </div>
                  <button
                    onClick={() => void navigate({ to: "/pricing" })}
                    className={`${pillBtnClass} px-4 py-2.5 text-sm shrink-0`}
                    style={inkBtnStyle}
                  >
                    <CreditCard className="w-4 h-4" />
                    Choose a plan
                  </button>
                </div>
              )}
            </div>

            <div style={{ ...glassCardStyle, padding: "22px 24px" }}>
              <div
                className="text-sm font-semibold mb-4"
                style={{ color: glass.ink }}
              >
                Notifications
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: glass.ink }}
                  >
                    Recommendation emails
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: glass.muted }}
                  >
                    Email me when the Swish team sends a recommendation.
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={notifyEmail}
                  onClick={() => void handleNotifyEmailToggle()}
                  disabled={notifyEmailSaving}
                  className="relative inline-flex h-5.5 w-10 shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:opacity-60"
                  style={{
                    background: notifyEmail ? glass.ink : "rgba(0,0,0,.18)",
                  }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    style={{
                      transform: notifyEmail
                        ? "translateX(20px)"
                        : "translateX(3px)",
                    }}
                  />
                </button>
              </div>
            </div>

            <div style={{ ...glassCardStyle, padding: "22px 24px" }}>
              <div
                className="text-sm font-semibold mb-4"
                style={{ color: glass.ink }}
              >
                Store
              </div>
              <div className="flex flex-col gap-3.5">
                <div>
                  <div
                    className="text-xs mb-1.5"
                    style={{ color: glass.muted }}
                  >
                    Store name
                  </div>
                  <div
                    className="rounded-lg px-3.5 py-2.5 text-sm"
                    style={{ ...fieldStyle }}
                  >
                    {store.name}
                  </div>
                </div>
                <div>
                  <div
                    className="text-xs mb-1.5"
                    style={{ color: glass.muted }}
                  >
                    Owner email
                  </div>
                  <div
                    className="rounded-lg px-3.5 py-2.5 text-sm"
                    style={{ ...fieldStyle }}
                  >
                    {store.owner_email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <input
        ref={csvRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleCsvImport}
      />

      <AddItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        storeId={store.id}
        storeEmail={store.owner_email}
        storeName={store.name}
        onAdded={handleItemAdded}
      />

      <CsvMappingDialog
        pending={csvPending}
        onClose={() => setCsvPending(null)}
        storeId={store.id}
        storeEmail={store.owner_email}
        storeName={store.name}
        onImported={(newItems) => {
          setItems((prev) => [...newItems, ...prev]);
          setCsvPending(null);
        }}
      />
    </div>
  );
}

function Badge({
  children,
  color,
  bg,
  dot,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
  dot?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0"
      style={{ background: bg, color }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: color }}
        />
      )}
      {children}
    </span>
  );
}

function MiniStat({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div
      style={{ ...glassCardSStyle, padding: "13px 16px" }}
      className="flex items-center justify-between"
    >
      <span className="text-xs" style={{ color: "#52525b" }}>
        {label}
      </span>
      {warn ? (
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: glass.warnTint, color: glass.warn }}
        >
          {value}
        </span>
      ) : (
        <span
          className="text-base font-bold tabular-nums"
          style={{ color: glass.ink }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

function TeaserCard({
  title,
  body,
  cta,
  onClick,
}: {
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div style={{ ...glassCardStyle, padding: "20px 22px" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold" style={{ color: glass.ink }}>
          {title}
        </span>
        <button
          onClick={onClick}
          className="text-xs font-medium cursor-pointer"
          style={{ color: glass.accent }}
        >
          {cta}
        </button>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: glass.muted }}>
        {body}
      </p>
    </div>
  );
}

function CsvMappingDialog({
  pending,
  onClose,
  storeId,
  storeEmail,
  storeName,
  onImported,
}: {
  pending: CsvPending | null;
  onClose: () => void;
  storeId: string;
  storeEmail: string;
  storeName: string;
  onImported: (items: Item[]) => void;
}) {
  const [nameCol, setNameCol] = useState(0);
  const [priceCol, setPriceCol] = useState(-1);
  const [stockCol, setStockCol] = useState(-1);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-guess the mapping from the header row each time a file is chosen.
  useEffect(() => {
    if (!pending) return;
    const nameGuess = guessCsvColumn(pending.headers, CSV_FIELD_HINTS.name);
    setNameCol(nameGuess >= 0 ? nameGuess : 0);
    setPriceCol(guessCsvColumn(pending.headers, CSV_FIELD_HINTS.price));
    setStockCol(guessCsvColumn(pending.headers, CSV_FIELD_HINTS.stock));
    setError(null);
  }, [pending]);

  if (!pending) return null;

  const mapRow = (cols: string[]) => {
    const name = cols[nameCol] ?? "";
    const priceRaw =
      priceCol >= 0 ? (cols[priceCol] ?? "").replace(/[$,\s]/g, "") : "";
    const stockRaw =
      stockCol >= 0 ? (cols[stockCol] ?? "").replace(/[,\s]/g, "") : "";
    const price = priceRaw ? parseFloat(priceRaw) : null;
    const stock = stockRaw ? parseInt(stockRaw, 10) : 0;
    return {
      name,
      price: price !== null && isNaN(price) ? null : price,
      stock: isNaN(stock) ? 0 : stock,
    };
  };

  const validRows = pending.rows.filter((cols) => (cols[nameCol] ?? "").trim());

  const handleImport = async () => {
    setImporting(true);
    setError(null);

    const inserts = validRows.map((cols) => ({
      store_id: storeId,
      store_email: storeEmail,
      store_name: storeName,
      ...mapRow(cols),
      image_url: null,
    }));

    const { data, error: insertError } = await supabase
      .from("items")
      .insert(inserts)
      .select();

    setImporting(false);
    if (insertError) {
      setError(insertError.message);
    } else if (data) {
      onImported(data as Item[]);
    }
  };

  const colSelect = (
    value: number,
    onChange: (v: number) => void,
    optional: boolean,
  ) => (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      disabled={importing}
      className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-1 focus:ring-black disabled:opacity-60"
      style={fieldStyle}
    >
      {optional && <option value={-1}>Not in file</option>}
      {pending.headers.map((h, i) => (
        <option key={i} value={i}>
          {h || `Column ${i + 1}`}
        </option>
      ))}
    </select>
  );

  return (
    <Dialog open onOpenChange={(v) => !v && !importing && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          background: "#fff",
          color: glass.ink,
          fontFamily: "Geist, system-ui, sans-serif",
        }}
      >
        <DialogTitle className="text-xl font-bold" style={{ color: glass.ink }}>
          Import CSV
        </DialogTitle>
        <DialogDescription style={{ color: glass.muted }}>
          {pending.fileName} — match your file's columns so items import
          correctly, whatever order your POS exports them in.
        </DialogDescription>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium"
              style={{ color: glass.muted }}
            >
              Item name <span style={{ color: glass.danger }}>*</span>
            </label>
            {colSelect(nameCol, setNameCol, false)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium"
                style={{ color: glass.muted }}
              >
                Price
              </label>
              {colSelect(priceCol, setPriceCol, true)}
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium"
                style={{ color: glass.muted }}
              >
                Stock
              </label>
              {colSelect(stockCol, setStockCol, true)}
            </div>
          </div>

          <div>
            <div
              className="text-[10.5px] uppercase tracking-wider font-semibold mb-1.5"
              style={{ color: glass.muted }}
            >
              Preview
            </div>
            <div
              className="rounded-lg overflow-hidden text-sm"
              style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)" }}
            >
              {validRows.length === 0 ? (
                <p className="px-3.5 py-2.5" style={{ color: glass.muted }}>
                  No rows have a value in the selected name column.
                </p>
              ) : (
                validRows.slice(0, 3).map((cols, i) => {
                  const row = mapRow(cols);
                  return (
                    <div
                      key={i}
                      className="grid px-3.5 py-2"
                      style={{
                        gridTemplateColumns: "1fr 80px 60px",
                        background: i % 2 ? "rgba(0,0,0,.03)" : undefined,
                      }}
                    >
                      <span className="truncate">{row.name}</span>
                      <span className="text-right tabular-nums">
                        {row.price != null ? `$${row.price.toFixed(2)}` : "—"}
                      </span>
                      <span className="text-right tabular-nums">
                        {row.stock}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm" style={{ color: glass.danger }}>
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={importing}
              className={`${pillBtnClass} !px-5 !py-2.5 text-sm`}
              style={outlineBtnStyle}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || validRows.length === 0}
              className={`${pillBtnClass} !px-5 !py-2.5 text-sm`}
              style={inkBtnStyle}
            >
              {importing
                ? "Importing…"
                : `Import ${validRows.length} item${validRows.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddItemDialog({
  open,
  onOpenChange,
  storeId,
  storeEmail,
  storeName,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  storeId: string;
  storeEmail: string;
  storeName: string;
  onAdded: (item: Item) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setName("");
    setPrice("");
    setStock("");
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);

    let image_url: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${storeId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(path, imageFile, { upsert: true });

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("item-images")
        .getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const { data, error: insertError } = await supabase
      .from("items")
      .insert({
        store_id: storeId,
        store_email: storeEmail,
        store_name: storeName,
        name: name.trim(),
        price: price ? parseFloat(price) : null,
        stock: stock ? parseInt(stock, 10) : 0,
        image_url,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    reset();
    onAdded(data);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        style={{
          background: "#fff",
          color: glass.ink,
          fontFamily: "Geist, system-ui, sans-serif",
        }}
      >
        <DialogTitle className="text-xl font-bold" style={{ color: glass.ink }}>
          Add item
        </DialogTitle>
        <DialogDescription style={{ color: glass.muted }}>
          Add a product to your store's live catalog.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Image picker */}
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full h-32 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden"
            style={{
              background: "rgba(0,0,0,.03)",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)",
            }}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <ImageIcon
                  className="w-6 h-6 mb-1.5"
                  style={{ color: glass.muted }}
                />
                <p className="text-xs" style={{ color: glass.muted }}>
                  Click to add image (optional)
                </p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImage}
          />

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium"
              style={{ color: glass.muted }}
            >
              Name <span style={{ color: glass.danger }}>*</span>
            </label>
            <input
              placeholder="e.g. Air Force 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              required
              className="w-full rounded-lg px-4 py-3 outline-none transition-shadow focus:ring-1 focus:ring-black disabled:opacity-60"
              style={fieldStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium"
                style={{ color: glass.muted }}
              >
                Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={saving}
                className="w-full rounded-lg px-4 py-3 outline-none transition-shadow focus:ring-1 focus:ring-black disabled:opacity-60"
                style={fieldStyle}
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium"
                style={{ color: glass.muted }}
              >
                Stock
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                disabled={saving}
                className="w-full rounded-lg px-4 py-3 outline-none transition-shadow focus:ring-1 focus:ring-black disabled:opacity-60"
                style={fieldStyle}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm" style={{ color: glass.danger }}>
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={saving}
              className={`${pillBtnClass} !px-5 !py-2.5 text-sm`}
              style={outlineBtnStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className={`${pillBtnClass} !px-5 !py-2.5 text-sm`}
              style={inkBtnStyle}
            >
              {saving ? "Adding…" : "Add item"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
