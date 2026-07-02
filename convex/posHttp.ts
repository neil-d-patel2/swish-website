// httpAction handlers must live outside "use node" files (same reason
// convex/stripeWebhook.ts is separate from convex/stripe.ts), so the OAuth
// callbacks live here and hand off to the Node-runtime actions in
// convex/posShopify.ts / convex/posSquare.ts via ctx.runAction.
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { verifyOAuthState } from "./posOAuthState";

export const shopifyCallback = httpAction(async (ctx, req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const shop = url.searchParams.get("shop");
  const state = url.searchParams.get("state");

  if (!code || !shop || !state) {
    return new Response("Missing code, shop, or state.", { status: 400 });
  }
  const decoded = await verifyOAuthState(state);
  if (!decoded) {
    return new Response("Invalid or expired state.", { status: 400 });
  }

  try {
    await ctx.runAction(internal.posShopify.exchangeCodeAndConnect, {
      shop,
      code,
      storeId: decoded.storeId,
    });
    return Response.redirect(
      `${decoded.origin}/store?pos=shopify_connected`,
      302,
    );
  } catch (err) {
    console.error("Shopify OAuth callback failed", err);
    return Response.redirect(`${decoded.origin}/store?pos=error`, 302);
  }
});

export const squareCallback = httpAction(async (ctx, req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error || !code || !state) {
    return new Response(
      `Square authorization failed: ${error ?? "missing code/state"}`,
      { status: 400 },
    );
  }
  const decoded = await verifyOAuthState(state);
  if (!decoded) {
    return new Response("Invalid or expired state.", { status: 400 });
  }

  try {
    await ctx.runAction(internal.posSquare.exchangeCodeAndConnect, {
      code,
      storeId: decoded.storeId,
    });
    return Response.redirect(
      `${decoded.origin}/store?pos=square_connected`,
      302,
    );
  } catch (err) {
    console.error("Square OAuth callback failed", err);
    return Response.redirect(`${decoded.origin}/store?pos=error`, 302);
  }
});
