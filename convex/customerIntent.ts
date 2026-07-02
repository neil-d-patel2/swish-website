/// <reference types="node" />
"use node";

// Aggregates over the mobile app's tracking tables (wishlists, item/store
// views, store followers) — same Supabase project, owned by the companion
// mobile app repo. Per that repo's README.analytics.md these are
// backend-only signals meant for service-role, business-facing aggregate use
// (e.g. this dashboard), never exposed with per-user PII. This file never
// returns a user_id, email, or username to the client — only counts and
// item-level text.

import { action } from "./_generated/server";
import { v } from "convex/values";
import { supabaseGet } from "./supabaseRest";

async function assertOwnsStore(storeId: string, ownerId: string) {
  const rows = await supabaseGet(
    `stores?id=eq.${encodeURIComponent(storeId)}&owner_id=eq.${encodeURIComponent(ownerId)}&select=id`,
  );
  if (rows.length === 0) throw new Error("Not authorized for this store.");
}

type Signal = {
  text: string;
  badge: "HOT" | "MED";
  createdAt: string;
};

function snapshotTitle(snapshot: unknown): string {
  const title = (snapshot as { title?: unknown } | null)?.title;
  return typeof title === "string" && title.trim() ? title : "an item";
}

export const getIntentSummary = action({
  args: { storeId: v.string(), ownerId: v.string() },
  handler: async (_ctx, { storeId, ownerId }) => {
    await assertOwnsStore(storeId, ownerId);

    const storeItems = await supabaseGet(
      `items?store_id=eq.${encodeURIComponent(storeId)}&select=id,name`,
    );
    const itemIds = storeItems.map((i) => i.id as string);
    const itemNameById = new Map(
      storeItems.map((i) => [i.id as string, i.name as string]),
    );

    const since7d = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [
      wishlistItemRows,
      recentViews,
      recentWishlistAdds,
      recentStoreViews,
      followerRows,
    ] = await Promise.all([
      itemIds.length > 0
        ? supabaseGet(
            `wishlist_items?item_id=in.(${itemIds.join(",")})&select=item_id`,
          )
        : Promise.resolve([]),
      supabaseGet(
        `item_views?store_id=eq.${encodeURIComponent(storeId)}&order=created_at.desc&limit=8&select=user_id,created_at,item_snapshot`,
      ),
      supabaseGet(
        `wishlist_events?store_id=eq.${encodeURIComponent(storeId)}&action=eq.add&order=created_at.desc&limit=8&select=user_id,created_at,item_snapshot`,
      ),
      supabaseGet(
        `store_views?store_id=eq.${encodeURIComponent(storeId)}&order=created_at.desc&limit=8&select=user_id,created_at`,
      ),
      supabaseGet(
        `store_followers?store_id=eq.${encodeURIComponent(storeId)}&select=user_id`,
      ),
    ]);

    // High-intent shoppers: distinct users touching this store in the last 7
    // days across views, store visits, and wishlist adds. Counted here, but
    // the user_ids themselves are never included in the returned value.
    const [highIntentViews, highIntentWishlist, highIntentStoreViews] =
      await Promise.all([
        supabaseGet(
          `item_views?store_id=eq.${encodeURIComponent(storeId)}&created_at=gte.${since7d}&select=user_id`,
        ),
        supabaseGet(
          `wishlist_events?store_id=eq.${encodeURIComponent(storeId)}&action=eq.add&created_at=gte.${since7d}&select=user_id`,
        ),
        supabaseGet(
          `store_views?store_id=eq.${encodeURIComponent(storeId)}&created_at=gte.${since7d}&select=user_id`,
        ),
      ]);
    const highIntentUserIds = new Set(
      [...highIntentViews, ...highIntentWishlist, ...highIntentStoreViews].map(
        (r) => r.user_id as string,
      ),
    );

    // Most-wishlisted items (top 5) — aggregate wishlist_items by item_id.
    const wishlistCountByItem = new Map<string, number>();
    for (const row of wishlistItemRows) {
      const id = row.item_id as string;
      wishlistCountByItem.set(id, (wishlistCountByItem.get(id) ?? 0) + 1);
    }
    const mostWishlisted = [...wishlistCountByItem.entries()]
      .map(([itemId, count]) => ({
        name: itemNameById.get(itemId) ?? "Unknown item",
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Live signals feed: merge the three most-recent event sources, no
    // per-user identifiers, newest first.
    const signals: Signal[] = [
      ...recentViews.map(
        (r): Signal => ({
          text: `Viewed ${snapshotTitle(r.item_snapshot)}`,
          badge: "MED",
          createdAt: r.created_at as string,
        }),
      ),
      ...recentWishlistAdds.map(
        (r): Signal => ({
          text: `Added ${snapshotTitle(r.item_snapshot)} to wishlist`,
          badge: "HOT",
          createdAt: r.created_at as string,
        }),
      ),
      ...recentStoreViews.map(
        (r): Signal => ({
          text: "Viewed your store",
          badge: "MED",
          createdAt: r.created_at as string,
        }),
      ),
    ]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8);

    return {
      itemsWishlisted: wishlistItemRows.length,
      highIntentShoppers7d: highIntentUserIds.size,
      followers: followerRows.length,
      mostWishlisted,
      signals,
      // No real definition/data exists yet for either metric (no
      // cart/purchase-attribution link between wishlist activity and
      // sales) — null means "show Coming soon", not a fabricated number.
      recovered30d: null as number | null,
      winBackRate: null as number | null,
    };
  },
});
