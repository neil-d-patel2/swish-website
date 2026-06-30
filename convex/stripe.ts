"use node";
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import Stripe from "stripe";

// Replace these with your actual Stripe Price IDs (price_...)
const PRICE_IDS = {
  starter: "price_1Tnv1k3Mu5gpxT7LgNeXzUkz",
  pro: "price_1Tnv2K3Mu5gpxT7LGzeQL8c3",
};

function stripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-06-24.dahlia",
  });
}

export const createCheckoutSession = action({
  args: {
    plan: v.union(v.literal("starter"), v.literal("pro")),
    userId: v.string(),
    email: v.string(),
    origin: v.string(),
  },
  handler: async (_ctx, { plan, userId, email, origin }) => {
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      customer_email: email,
      metadata: { userId, plan },
      subscription_data: { trial_period_days: 14 },
      success_url: `${origin}/store?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
    });
    return session.url;
  },
});

export const processWebhook = internalAction({
  args: { body: v.bytes(), sig: v.string() },
  handler: async (_ctx, { body, sig }) => {
    let event: Stripe.Event;
    try {
      event = stripe().webhooks.constructEvent(
        Buffer.from(body),
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      throw new Error(`Webhook Error: ${(err as Error).message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, plan } = session.metadata ?? {};
      if (userId && plan) {
        await supabasePatch(`stores?owner_id=eq.${userId}`, {
          plan,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      await supabasePatch(
        `stores?stripe_customer_id=eq.${sub.customer as string}`,
        { plan: "free", stripe_subscription_id: null },
      );
    }
  },
});

// Called client-side on the success page to write the plan without waiting for a webhook.
// Verifies the session belongs to the user before touching Supabase.
export const fulfillCheckout = action({
  args: { sessionId: v.string(), userId: v.string() },
  handler: async (_ctx, { sessionId, userId }) => {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    if (session.metadata?.userId !== userId) return null;
    if (session.status !== "complete") return null;
    const plan = session.metadata?.plan;
    if (!plan) return null;
    await supabasePatch(`stores?owner_id=eq.${encodeURIComponent(userId)}`, {
      plan,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
    });
    return plan;
  },
});

export const cancelSubscription = action({
  args: { userId: v.string() },
  handler: async (_ctx, { userId }) => {
    // Fetch subscription ID server-side so the client can't spoof a different sub
    const rows = await supabaseGet(
      `stores?owner_id=eq.${encodeURIComponent(userId)}&select=stripe_subscription_id`,
    );
    const subscriptionId = rows[0]?.stripe_subscription_id as string | null | undefined;
    if (!subscriptionId) throw new Error("No active subscription found.");
    await stripe().subscriptions.cancel(subscriptionId);
    await supabasePatch(`stores?owner_id=eq.${encodeURIComponent(userId)}`, {
      plan: "free",
      stripe_subscription_id: null,
    });
  },
});

async function supabaseGet(path: string): Promise<Record<string, unknown>[]> {
  const url = process.env.SUPABASE_URL!.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    throw new Error(`Supabase GET failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<Record<string, unknown>[]>;
}

async function supabasePatch(path: string, body: Record<string, unknown>) {
  const url = process.env.SUPABASE_URL!.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Supabase PATCH failed: ${res.status} ${await res.text()}`);
  }
}
