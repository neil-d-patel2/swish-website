import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const stripeWebhook = httpAction(async (ctx, req) => {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await req.bytes();

  try {
    await ctx.runAction(internal.stripe.processWebhook, { body: body.buffer as ArrayBuffer, sig });
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, {
      status: 400,
    });
  }

  return new Response(null, { status: 200 });
});
