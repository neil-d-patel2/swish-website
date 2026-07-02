/// <reference types="node" />
"use node";

import { internalAction } from "./_generated/server";
import { supabaseGet } from "./supabaseRest";
import { syncShopifyStore } from "./posShopify";
import { syncSquareStore } from "./posSquare";

// Fast-follow to the manual "Sync now" button — periodically refreshes every
// connected store's catalog and sales without the owner having to ask.
export const syncAllConnected = internalAction({
  args: {},
  handler: async () => {
    const connections = await supabaseGet(
      "pos_connections?status=eq.connected&select=store_id,provider",
    );

    for (const conn of connections) {
      const storeId = conn.store_id as string;
      const provider = conn.provider as string;
      try {
        if (provider === "shopify") await syncShopifyStore(storeId);
        else if (provider === "square") await syncSquareStore(storeId);
      } catch (err) {
        console.error(
          `POS cron sync failed for store ${storeId} (${provider})`,
          err,
        );
      }
    }
    return null;
  },
});
