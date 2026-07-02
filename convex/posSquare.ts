/// <reference types="node" />
"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import {
  supabaseGet,
  supabaseUpsert,
  supabasePatch,
  supabaseDelete,
} from "./supabaseRest";
import { createOAuthState } from "./posOAuthState";

const SQUARE_VERSION = "2024-10-17";

function squareBase() {
  return process.env.SQUARE_ENV === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

async function assertOwnsStore(storeId: string, ownerId: string) {
  const rows = await supabaseGet(
    `stores?id=eq.${encodeURIComponent(storeId)}&owner_id=eq.${encodeURIComponent(ownerId)}&select=id`,
  );
  if (rows.length === 0) throw new Error("Not authorized for this store.");
}

export const createConnectState = action({
  args: { storeId: v.string(), ownerId: v.string(), origin: v.string() },
  handler: async (_ctx, { storeId, ownerId, origin }) => {
    await assertOwnsStore(storeId, ownerId);
    return createOAuthState(storeId, origin);
  },
});

async function squareFetch<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${squareBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(
      `Square API ${path} failed: ${res.status} ${await res.text()}`,
    );
  }
  return res.json() as Promise<T>;
}

type SquareCatalogVariation = {
  id: string;
  item_variation_data?: { price_money?: { amount: number } };
};
type SquareCatalogObject = {
  id: string;
  type: string;
  item_data?: {
    name: string;
    variations?: SquareCatalogVariation[];
  };
};
type SquareInventoryCount = { catalog_object_id: string; quantity: string };
type SquareOrderLineItem = {
  uid: string;
  name: string;
  quantity: string;
  base_price_money?: { amount: number };
  catalog_object_id?: string;
};
type SquareOrder = {
  id: string;
  created_at: string;
  line_items?: SquareOrderLineItem[];
};

// Exported (not internalAction-wrapped) so it can be called directly from
// this file's public actions and from convex/posSync.ts's cron job.
export async function syncSquareStore(
  storeId: string,
): Promise<{ items: number; sales: number }> {
  const credRows = await supabaseGet(
    `pos_credentials?store_id=eq.${encodeURIComponent(storeId)}&provider=eq.square&select=access_token`,
  );
  const accessToken = credRows[0]?.access_token as string | undefined;
  if (!accessToken) {
    throw new Error("Square is not connected for this store.");
  }

  try {
    // Catalog sync is the core of "connected" — it must succeed. Orders are
    // synced best-effort (mirrors convex/posShopify.ts): a merchant that
    // hasn't granted ORDERS_READ, or any other order-search failure, must
    // never take the catalog sync down with it.
    const [storeRows, catalogRes] = await Promise.all([
      supabaseGet(
        `stores?id=eq.${encodeURIComponent(storeId)}&select=owner_email,name`,
      ),
      squareFetch<{ objects?: SquareCatalogObject[] }>(
        accessToken,
        "/v2/catalog/list?types=ITEM",
      ),
    ]);
    const storeEmail = (storeRows[0]?.owner_email as string | null) ?? null;
    const storeName = (storeRows[0]?.name as string | null) ?? null;
    const catalogObjects = catalogRes.objects ?? [];

    // Best-effort: requires the INVENTORY_READ scope, which a merchant who
    // connected before it was added to the OAuth request won't have granted
    // yet. Missing/insufficient scope must not block name/price catalog sync
    // — it should just leave stock at 0 (mirrors the orders/sales handling).
    const variationIds = catalogObjects.flatMap(
      (o) => o.item_data?.variations?.map((v) => v.id) ?? [],
    );
    const countByVariation = new Map<string, number>();
    if (variationIds.length > 0) {
      try {
        const inventoryRes = await squareFetch<{
          counts?: SquareInventoryCount[];
        }>(accessToken, "/v2/inventory/counts/batch-retrieve", {
          method: "POST",
          body: JSON.stringify({ catalog_object_ids: variationIds }),
        });
        for (const c of inventoryRes.counts ?? []) {
          countByVariation.set(
            c.catalog_object_id,
            (countByVariation.get(c.catalog_object_id) ?? 0) +
              parseInt(c.quantity, 10),
          );
        }
      } catch (err) {
        console.error(`Square inventory fetch failed for store ${storeId}`, err);
      }
    }

    const itemRows = catalogObjects
      .filter((o) => o.item_data)
      .map((o) => {
        const variation = o.item_data!.variations?.[0];
        return {
          store_id: storeId,
          store_email: storeEmail,
          store_name: storeName,
          name: o.item_data!.name,
          price: variation?.item_variation_data?.price_money
            ? variation.item_variation_data.price_money.amount / 100
            : null,
          stock: variation ? (countByVariation.get(variation.id) ?? 0) : 0,
          image_url: null,
          source: "square",
          external_id: o.id,
        };
      });
    if (itemRows.length > 0) {
      await supabaseUpsert("items", itemRows, "store_id,source,external_id");
    }

    let saleCount = 0;
    let salesError: string | null = null;
    try {
      const itemIdByExternal = new Map<string, string>();
      if (itemRows.length > 0) {
        const synced = await supabaseGet(
          `items?store_id=eq.${encodeURIComponent(storeId)}&source=eq.square&select=id,external_id`,
        );
        for (const row of synced) {
          itemIdByExternal.set(row.external_id as string, row.id as string);
        }
      }

      const locationsRes = await squareFetch<{ locations?: { id: string }[] }>(
        accessToken,
        "/v2/locations",
      );
      const locationIds = (locationsRes.locations ?? []).map((l) => l.id);
      let orders: SquareOrder[] = [];
      if (locationIds.length > 0) {
        const ordersRes = await squareFetch<{ orders?: SquareOrder[] }>(
          accessToken,
          "/v2/orders/search",
          {
            method: "POST",
            body: JSON.stringify({
              location_ids: locationIds,
              query: { filter: { state_filter: { states: ["COMPLETED"] } } },
              limit: 100,
            }),
          },
        );
        orders = ordersRes.orders ?? [];
      }

      const saleRows = orders.flatMap((order) =>
        (order.line_items ?? []).map((li) => ({
          store_id: storeId,
          item_id: li.catalog_object_id
            ? (itemIdByExternal.get(li.catalog_object_id) ?? null)
            : null,
          provider: "square",
          external_order_id: order.id,
          external_line_item_id: li.uid,
          item_name: li.name,
          quantity: parseInt(li.quantity, 10),
          unit_price: li.base_price_money ? li.base_price_money.amount / 100 : null,
          total_price: li.base_price_money
            ? (li.base_price_money.amount / 100) * parseInt(li.quantity, 10)
            : null,
          sold_at: order.created_at,
        })),
      );
      if (saleRows.length > 0) {
        await supabaseUpsert(
          "sales",
          saleRows,
          "store_id,provider,external_order_id,external_line_item_id",
        );
      }
      saleCount = saleRows.length;
    } catch (err) {
      salesError = (err as Error).message;
      console.error(`Square sales sync failed for store ${storeId}`, err);
    }

    await supabasePatch(
      `pos_connections?store_id=eq.${encodeURIComponent(storeId)}&provider=eq.square`,
      {
        status: "connected",
        last_synced_at: new Date().toISOString(),
        last_sync_status: salesError ? "partial" : "ok",
        last_sync_error: salesError,
      },
    );

    return { items: itemRows.length, sales: saleCount };
  } catch (err) {
    await supabasePatch(
      `pos_connections?store_id=eq.${encodeURIComponent(storeId)}&provider=eq.square`,
      {
        status: "error",
        last_sync_status: "error",
        last_sync_error: (err as Error).message,
      },
    );
    throw err;
  }
}

export const syncNow = action({
  args: { storeId: v.string(), ownerId: v.string() },
  handler: async (_ctx, { storeId, ownerId }) => {
    await assertOwnsStore(storeId, ownerId);
    return syncSquareStore(storeId);
  },
});

export const disconnect = action({
  args: { storeId: v.string(), ownerId: v.string() },
  handler: async (_ctx, { storeId, ownerId }) => {
    await assertOwnsStore(storeId, ownerId);
    await supabaseDelete(
      `pos_credentials?store_id=eq.${encodeURIComponent(storeId)}&provider=eq.square`,
    );
    await supabasePatch(
      `pos_connections?store_id=eq.${encodeURIComponent(storeId)}&provider=eq.square`,
      { status: "disconnected" },
    );
    return null;
  },
});

// internalAction (not a plain function) so the httpAction callback in
// convex/posHttp.ts — which must live outside "use node" files, same as
// convex/stripeWebhook.ts vs convex/stripe.ts — can reach it via ctx.runAction.
export const exchangeCodeAndConnect = internalAction({
  args: { code: v.string(), storeId: v.string() },
  handler: async (_ctx, { code, storeId }) => {
    const tokenRes = await fetch(`${squareBase()}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SQUARE_CLIENT_ID,
        client_secret: process.env.SQUARE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) {
      throw new Error(
        `Square token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`,
      );
    }
    const { access_token, refresh_token, expires_at, merchant_id } =
      (await tokenRes.json()) as {
        access_token: string;
        refresh_token?: string;
        expires_at?: string;
        merchant_id: string;
      };

    await supabaseUpsert(
      "pos_connections",
      [
        {
          store_id: storeId,
          provider: "square",
          status: "connected",
          external_account: merchant_id,
          connected_at: new Date().toISOString(),
        },
      ],
      "store_id,provider",
    );
    await supabaseUpsert(
      "pos_credentials",
      [
        {
          store_id: storeId,
          provider: "square",
          access_token,
          refresh_token: refresh_token ?? null,
          token_expires_at: expires_at ?? null,
          updated_at: new Date().toISOString(),
        },
      ],
      "store_id,provider",
    );

    await syncSquareStore(storeId);
    return null;
  },
});
