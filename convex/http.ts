import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { stripeWebhook } from "./stripeWebhook";
import { shopifyCallback, squareCallback } from "./posHttp";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: stripeWebhook,
});

http.route({
  path: "/pos/shopify/callback",
  method: "GET",
  handler: shopifyCallback,
});

http.route({
  path: "/pos/square/callback",
  method: "GET",
  handler: squareCallback,
});

export default http;
