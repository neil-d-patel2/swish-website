"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";

// Resend batch API limit
const BATCH_SIZE = 100;

export const send = action({
  args: {
    subject: v.string(),
    message: v.string(), // plain text — wrapped in branded template
  },
  handler: async (ctx, { subject, message }) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const entries = await ctx.runQuery(internal.waitlist.listAll);

    if (entries.length === 0) {
      return { sent: 0 };
    }

    const html = buildEmail(message);
    let sent = 0;

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);

      const { error } = await resend.batch.send(
        batch.map((entry) => ({
          from: "Swish <hello@swish.app>",
          to: entry.email,
          subject,
          html,
        })),
      );

      if (error) throw new Error(error.message);
      sent += batch.length;
    }

    return { sent };
  },
});

function buildEmail(message: string) {
  // Convert newlines to <br> for HTML
  const bodyHtml = message.replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050508;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0d0d14;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
          <tr>
            <td style="padding:36px 40px 28px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Swish</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;font-size:15px;color:rgba(255,255,255,0.6);line-height:1.7;">
                ${bodyHtml}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);line-height:1.5;">
                © 2025 Swish · You're receiving this because you joined our waitlist.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
