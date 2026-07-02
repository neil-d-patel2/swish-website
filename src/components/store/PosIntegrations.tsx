import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Unplug, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

const ink = "var(--mk-ink)";
const muted = "var(--mk-muted)";
const surface = "var(--mk-surface)";
const onAccent = "var(--mk-on-accent)";
const heading = "var(--font-heading)";
const body = "var(--font-body)";
const hairline = "var(--mk-hairline)";
const danger = "#ba1a1a";
const creamCard = "var(--mk-cream-card)";

const inkBtnClass =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-medium shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-sm";
const inkBtnStyle = { background: ink, color: onAccent, fontFamily: body } as const;
const outlineBtnClass =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all active:scale-95 duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-sm";
const outlineBtnStyle = { background: surface, color: ink, fontFamily: body, boxShadow: hairline } as const;

type Provider = "shopify" | "square";

type PosConnection = {
  provider: Provider;
  status: "connected" | "disconnected" | "error";
  external_account: string | null;
  last_synced_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
};

const SQUARE_AUTH_BASE =
  (import.meta.env.VITE_SQUARE_ENV as string | undefined) === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";

export function PosIntegrations({
  storeId,
  ownerId,
}: {
  storeId: string;
  ownerId: string;
}) {
  const [connections, setConnections] = useState<Record<Provider, PosConnection | null>>({
    shopify: null,
    square: null,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("pos_connections")
      .select(
        "provider,status,external_account,last_synced_at,last_sync_status,last_sync_error",
      )
      .eq("store_id", storeId);
    const byProvider: Record<Provider, PosConnection | null> = {
      shopify: null,
      square: null,
    };
    for (const row of (data ?? []) as PosConnection[]) {
      byProvider[row.provider] = row;
    }
    setConnections(byProvider);
    setLoading(false);
  }, [storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: heading, color: ink }}
        >
          POS integrations
        </h2>
      </div>
      <p className="text-sm mb-6 max-w-2xl" style={{ color: muted }}>
        Connect Shopify or Square to automatically keep your catalog and
        sales numbers in sync — no manual CSV imports needed.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ProviderCard
          provider="shopify"
          storeId={storeId}
          ownerId={ownerId}
          connection={loading ? undefined : connections.shopify}
          onChanged={load}
        />
        <ProviderCard
          provider="square"
          storeId={storeId}
          ownerId={ownerId}
          connection={loading ? undefined : connections.square}
          onChanged={load}
        />
      </div>
    </section>
  );
}

function ProviderCard({
  provider,
  storeId,
  ownerId,
  connection,
  onChanged,
}: {
  provider: Provider;
  storeId: string;
  ownerId: string;
  connection: PosConnection | null | undefined;
  onChanged: () => void;
}) {
  const label = provider === "shopify" ? "Shopify" : "Square";
  const [shopDomain, setShopDomain] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShopifyState = useAction(api.posShopify.createConnectState);
  const shopifySyncNow = useAction(api.posShopify.syncNow);
  const shopifyDisconnect = useAction(api.posShopify.disconnect);
  const createSquareState = useAction(api.posSquare.createConnectState);
  const squareSyncNow = useAction(api.posSquare.syncNow);
  const squareDisconnect = useAction(api.posSquare.disconnect);

  const handleConnect = async () => {
    setError(null);
    setConnecting(true);
    try {
      const origin = window.location.origin;
      const siteUrl = (import.meta.env.VITE_CONVEX_SITE_URL as string).replace(/\/$/, "");

      if (provider === "shopify") {
        const domain = shopDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
        const shop = domain.includes(".") ? domain : `${domain}.myshopify.com`;
        const state = await createShopifyState({ storeId, ownerId, origin });
        const params = new URLSearchParams({
          client_id: import.meta.env.VITE_SHOPIFY_CLIENT_ID as string,
          scope: "read_products,read_orders",
          redirect_uri: `${siteUrl}/pos/shopify/callback`,
          state,
        });
        window.location.href = `https://${shop}/admin/oauth/authorize?${params.toString()}`;
      } else {
        const state = await createSquareState({ storeId, ownerId, origin });
        const params = new URLSearchParams({
          client_id: import.meta.env.VITE_SQUARE_CLIENT_ID as string,
          scope: "ITEMS_READ ORDERS_READ MERCHANT_PROFILE_READ INVENTORY_READ",
          session: "false",
          state,
        });
        window.location.href = `${SQUARE_AUTH_BASE}/oauth2/authorize?${params.toString()}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start connection.");
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setError(null);
    setSyncing(true);
    try {
      if (provider === "shopify") await shopifySyncNow({ storeId, ownerId });
      else await squareSyncNow({ storeId, ownerId });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    setDisconnecting(true);
    try {
      if (provider === "shopify") await shopifyDisconnect({ storeId, ownerId });
      else await squareDisconnect({ storeId, ownerId });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not disconnect.");
    } finally {
      setDisconnecting(false);
    }
  };

  const isConnected = connection?.status === "connected";

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: surface, boxShadow: hairline }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: creamCard, boxShadow: hairline }}
          >
            <Zap className="w-4 h-4" style={{ color: ink }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: ink, fontFamily: heading }}>
              {label}
            </p>
            {connection === undefined ? (
              <p className="text-xs" style={{ color: muted }}>
                Loading…
              </p>
            ) : isConnected ? (
              <p className="text-xs" style={{ color: "#15803d" }}>
                Connected{connection?.external_account ? ` · ${connection.external_account}` : ""}
              </p>
            ) : connection?.status === "error" ? (
              <p className="text-xs" style={{ color: danger }}>
                Sync error
              </p>
            ) : (
              <p className="text-xs" style={{ color: muted }}>
                Not connected
              </p>
            )}
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: muted }}>
            {connection?.last_synced_at
              ? `Last synced ${new Date(connection.last_synced_at).toLocaleString()}`
              : "Not synced yet."}
          </p>
          {connection?.last_sync_error && (
            <p className="text-xs" style={{ color: danger }}>
              {connection.last_sync_error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              className={outlineBtnClass}
              style={outlineBtnStyle}
              onClick={() => void handleSync()}
              disabled={syncing}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing…" : "Sync now"}
            </button>
            <button
              className={outlineBtnClass}
              style={{ ...outlineBtnStyle, color: danger }}
              onClick={() => void handleDisconnect()}
              disabled={disconnecting}
            >
              <Unplug className="w-3.5 h-3.5" />
              {disconnecting ? "Disconnecting…" : "Disconnect"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {provider === "shopify" && (
            <input
              type="text"
              placeholder="your-shop.myshopify.com"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              disabled={connecting}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-shadow focus:ring-1 focus:ring-black disabled:opacity-60"
              style={{ background: creamCard, color: ink, fontFamily: body, boxShadow: hairline }}
            />
          )}
          <button
            className={inkBtnClass}
            style={inkBtnStyle}
            onClick={() => void handleConnect()}
            disabled={connecting || (provider === "shopify" && !shopDomain.trim())}
          >
            {connecting ? "Redirecting…" : `Connect ${label}`}
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs mt-3" style={{ color: danger }}>
          {error}
        </p>
      )}
    </div>
  );
}
