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

const API_VERSION = "2024-10";

function shopifyBase(shop: string) {
  return `https://${shop}/admin/api/${API_VERSION}`;
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

type ShopifyVariant = {
  price: string;
  inventory_quantity: number | null;
};
type ShopifyProduct = {
  id: number;
  title: string;
  image: { src: string } | null;
  variants: ShopifyVariant[];
};
type ShopifyLineItem = {
  id: number;
  title: string;
  quantity: number;
  price: string;
  product_id: number | null;
};
type ShopifyOrder = {
  id: number;
  created_at: string;
  line_items: ShopifyLineItem[];
};

async function shopifyFetch<T>(
  shop: string,
  accessToken: string,
  path: string,
): Promise<T> {
  const res = await fetch(`${shopifyBase(shop)}${path}`, {
    headers: { "X-Shopify-Access-Token": accessToken },
  });
  if (!res.ok) {
    throw new Error(
      `Shopify API ${path} failed: ${res.status} ${await res.text()}`,
    );
  }
  return res.json() as Promise<T>;
}

// Exported (not internalAction-wrapped) so it can be called directly, both
// from this file's public actions and from convex/posSync.ts's cron job,
// without an extra action-to-action hop (same runtime, no need to cross via
// ctx.runAction per the Convex function-calling guidelines).
export async function syncShopifyStore(
  storeId: string,
): Promise<{ items: number; sales: number }> {
  const [connectionRows, credRows] = await Promise.all([
    supabaseGet(
      `pos_connections?store_id=eq.${encodeURIComponent(storeId)}&provider=eq.shopify&select=external_account`,
    ),
    supabaseGet(
      `pos_credentials?store_id=eq.${encodeURIComponent(storeId)}&provider=eq.shopify&select=access_token`,
    ),
  ]);
  const shop = connectionRows[0]?.external_account as string | undefined;
  const accessToken = credRows[0]?.access_token as string | undefined;
  if (!shop || !accessToken) {
    throw new Error("Shopify is not connected for this store.");
  }

  try {
    // Catalog sync is the core of "connected" — it must succeed. Orders
    // requires Shopify's separate "protected customer data" app approval
    // (https://shopify.dev/docs/apps/launch/protected-customer-data), which
    // most custom apps don't have by default, so it's synced best-effort and
    // must never take the catalog down with it if it 403s.
    const [storeRows, productsRes] = await Promise.all([
      supabaseGet(
        `stores?id=eq.${encodeURIComponent(storeId)}&select=owner_email,name`,
      ),
      shopifyFetch<{ products: ShopifyProduct[] }>(
        shop,
        accessToken,
        "/products.json?limit=250",
      ),
    ]);
    const storeEmail = (storeRows[0]?.owner_email as string | null) ?? null;
    const storeName = (storeRows[0]?.name as string | null) ?? null;

    const itemRows = productsRes.products.map((p) => {
      const variant = p.variants[0];
      return {
        store_id: storeId,
        store_email: storeEmail,
        store_name: storeName,
        name: p.title,
        price: variant ? parseFloat(variant.price) : null,
        stock: variant?.inventory_quantity ?? 0,
        image_url: p.image?.src ?? null,
        source: "shopify",
        external_id: String(p.id),
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
          `items?store_id=eq.${encodeURIComponent(storeId)}&source=eq.shopify&select=id,external_id`,
        );
        for (const row of synced) {
          itemIdByExternal.set(row.external_id as string, row.id as string);
        }
      }

      const ordersRes = await shopifyFetch<{ orders: ShopifyOrder[] }>(
        shop,
        accessToken,
        "/orders.json?status=any&limit=250",
      );
      const saleRows = ordersRes.orders.flatMap((order) =>
        order.line_items.map((li) => ({
          store_id: storeId,
          item_id: li.product_id
            ? (itemIdByExternal.get(String(li.product_id)) ?? null)
            : null,
          provider: "shopify",
          external_order_id: String(order.id),
          external_line_item_id: String(li.id),
          item_name: li.title,
          quantity: li.quantity,
          unit_price: parseFloat(li.price),
          total_price: parseFloat(li.price) * li.quantity,
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
      console.error(`Shopify sales sync failed for store ${storeId}`, err);
    }

    await supabasePatch(
      `pos_connections?store_id=eq.${encodeURIComponent(storeId)}&provider=eq.shopify`,
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
      `pos_connections?store_id=eq.${encodeURIComponent(storeId)}&provider=eq.shopify`,
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
    return syncShopifyStore(storeId);
  },
});

export const disconnect = action({
  args: { storeId: v.string(), ownerId: v.string() },
  handler: async (_ctx, { storeId, ownerId }) => {
    await assertOwnsStore(storeId, ownerId);
    await supabaseDelete(
      `pos_credentials?store_id=eq.${encodeURIComponent(storeId)}&provider=eq.shopify`,
    );
    await supabasePatch(
      `pos_connections?store_id=eq.${encodeURIComponent(storeId)}&provider=eq.shopify`,
      { status: "disconnected" },
    );
    return null;
  },
});

// internalAction (not a plain function) so the httpAction callback in
// convex/posHttp.ts — which must live outside "use node" files, same as
// convex/stripeWebhook.ts vs convex/stripe.ts — can reach it via ctx.runAction.
export const exchangeCodeAndConnect = internalAction({
  args: { shop: v.string(), code: v.string(), storeId: v.string() },
  handler: async (_ctx, { shop, code, storeId }) => {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code,
      }),
    });
    if (!tokenRes.ok) {
      throw new Error(
        `Shopify token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`,
      );
    }
    const { access_token, scope } = (await tokenRes.json()) as {
      access_token: string;
      scope: string;
    };

    await supabaseUpsert(
      "pos_connections",
      [
        {
          store_id: storeId,
          provider: "shopify",
          status: "connected",
          external_account: shop,
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
          provider: "shopify",
          access_token,
          scope,
          updated_at: new Date().toISOString(),
        },
      ],
      "store_id,provider",
    );

    await syncShopifyStore(storeId);
    return null;
  },
});
