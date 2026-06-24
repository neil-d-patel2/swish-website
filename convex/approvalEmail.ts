/// <reference types="node" />
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Notifies the owner that a new Google user is waiting for store access.
// Called once, on the user's first sign-in (see src/hooks/use-approval.ts).
export const notify = action({
  args: {
    email: v.string(),
    origin: v.string(),
  },
  handler: async (_ctx, { email, origin }) => {
    const cleanEmail = email.trim().toLowerCase();
    const approvalsUrl = `${origin.replace(/\/$/, "")}/approvals`;

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Swish <hello@swish.app>",
      to: "swishappdev@gmail.com",
      subject: `[Approval] New signup — ${cleanEmail}`,
      html: `
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
              <p style="margin:8px 0 0;font-size:13px;color:#434653;">New store-access request</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#737784;">Google account</p>
              <p style="margin:0 0 24px;font-size:16px;color:#1b1c1d;">${escapeHtml(cleanEmail)}</p>
              <a href="${escapeHtml(approvalsUrl)}" style="display:inline-block;background:#094cb2;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:999px;">Review &amp; approve →</a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #efedee;">
              <p style="margin:0;font-size:12px;color:#737784;line-height:1.5;">
                Open the approvals page and sign in as the owner to grant or deny access.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });

    return null;
  },
});
