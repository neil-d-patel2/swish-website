// OAuth `state` is signed (HMAC) rather than looked up server-side, since the
// callback request comes from Shopify/Square's redirect, not from our own
// frontend, so there's no session to check it against. Embedding the
// initiating origin lets the callback redirect back to wherever the app is
// being served from (same trust model already used for `origin` args on
// convex/stripe.ts's createCheckoutSession and convex/approvalEmail.ts).
//
// Uses the Web Crypto API (not Node's `crypto` module) so this plain helper
// module — which registers no Convex function of its own — works no matter
// which runtime the files that import it get bundled into.
const MAX_AGE_MS = 15 * 60 * 1000;
const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  let bin = "";
  for (const byte of new Uint8Array(bytes)) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    s.length + ((4 - (s.length % 4)) % 4),
    "=",
  );
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.POS_OAUTH_STATE_SECRET!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createOAuthState(
  storeId: string,
  origin: string,
): Promise<string> {
  const payload = JSON.stringify({ storeId, origin, ts: Date.now() });
  const payloadBytes = encoder.encode(payload);
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), payloadBytes);
  return `${toBase64Url(payloadBytes.buffer as ArrayBuffer)}.${toBase64Url(sig)}`;
}

export async function verifyOAuthState(
  state: string,
): Promise<{ storeId: string; origin: string } | null> {
  const [payloadB64, sigB64] = state.split(".");
  if (!payloadB64 || !sigB64) return null;

  const payloadBytes = fromBase64Url(payloadB64);
  const sigBytes = fromBase64Url(sigB64);
  const valid = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(),
    sigBytes as BufferSource,
    payloadBytes as BufferSource,
  );
  if (!valid) return null;

  let parsed: { storeId: string; origin: string; ts: number };
  try {
    parsed = JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return null;
  }
  if (!Number.isFinite(parsed.ts) || Date.now() - parsed.ts > MAX_AGE_MS) {
    return null;
  }
  return { storeId: parsed.storeId, origin: parsed.origin };
}
