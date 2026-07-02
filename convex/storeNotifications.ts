/// <reference types="node" />
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import { supabaseGet, supabaseInsert, supabasePatch } from "./supabaseRest";

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const TYPE_LABEL: Record<string, string> = {
  recommendation: "Recommendation",
  high_intent_item: "High-intent item",
  high_intent_customer: "High-intent customer",
  stocking_idea: "Stocking idea",
  marketing: "Marketing idea",
  general: "Update",
};

// Sent by the Swish team from /approvals to a specific store. Not
// transport-authenticated, same known-limitation tradeoff as
// convex/approvalEmail.ts's notify and convex/waitlistBroadcast.ts's send —
// the write itself uses the Supabase service role and is only ever reachable
// through the admin-gated /approvals UI.
export const send = action({
  args: {
    storeId: v.string(),
    type: v.union(
      v.literal("recommendation"),
      v.literal("high_intent_item"),
      v.literal("high_intent_customer"),
      v.literal("stocking_idea"),
      v.literal("marketing"),
      v.literal("general"),
    ),
    title: v.string(),
    body: v.string(),
    ctaLabel: v.optional(v.string()),
    ctaUrl: v.optional(v.string()),
    sendEmail: v.boolean(),
  },
  handler: async (
    _ctx,
    { storeId, type, title, body, ctaLabel, ctaUrl, sendEmail },
  ) => {
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (!cleanTitle || !cleanBody) {
      throw new Error("Title and body are required.");
    }

    const storeRows = await supabaseGet(
      `stores?id=eq.${encodeURIComponent(storeId)}&select=owner_email,name,notify_email`,
    );
    const store = storeRows[0] as
      | { owner_email: string | null; name: string; notify_email: boolean }
      | undefined;
    if (!store) throw new Error("Store not found.");

    const [inserted] = await supabaseInsert("store_notifications", [
      {
        store_id: storeId,
        type,
        title: cleanTitle,
        body: cleanBody,
        cta_label: ctaLabel?.trim() || null,
        cta_url: ctaUrl?.trim() || null,
      },
    ]);

    const shouldEmail = sendEmail && store.notify_email && !!store.owner_email;
    if (shouldEmail) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Swish <hello@swish.app>",
        to: store.owner_email!,
        subject: `[Swish] ${cleanTitle}`,
        html: buildEmail({
          storeName: store.name,
          typeLabel: TYPE_LABEL[type],
          title: cleanTitle,
          body: cleanBody,
          ctaLabel,
          ctaUrl,
        }),
      });
      await supabasePatch(
        `store_notifications?id=eq.${encodeURIComponent(inserted.id as string)}`,
        { emailed_at: new Date().toISOString() },
      );
    }

    return { id: inserted.id as string, emailed: shouldEmail };
  },
});

function buildEmail({
  storeName,
  typeLabel,
  title,
  body,
  ctaLabel,
  ctaUrl,
}: {
  storeName: string;
  typeLabel: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  const cta =
    ctaUrl && ctaLabel
      ? `<a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#094cb2;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:999px;">${escapeHtml(ctaLabel)} →</a>`
      : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf9fa;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9fa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e3e2e3;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #efedee;">
              <span style="font-size:20px;font-weight:700;color:#094cb2;letter-spacing:-0.5px;">Swish</span>
              <p style="margin:8px 0 0;font-size:13px;color:#434653;">${escapeHtml(typeLabel)} for ${escapeHtml(storeName)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#1b1c1d;">${escapeHtml(title)}</p>
              <p style="margin:0 0 24px;font-size:14px;color:#1b1c1d;line-height:1.6;white-space:pre-wrap;">${escapeHtml(body)}</p>
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #efedee;">
              <p style="margin:0;font-size:12px;color:#737784;line-height:1.5;">
                From the Swish team. You can turn these emails off anytime from your store settings.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim();
}
