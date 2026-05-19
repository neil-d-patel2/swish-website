/// <reference types="node" />
"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendConfirmation = internalAction({
  args: { email: v.string() },
  handler: async (_ctx, { email }) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Swish <hello@swish.app>",
      to: email,
      subject: "You're on the Swish waitlist 🎉",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050508;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0d0d14;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:36px 40px 28px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Swish</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 12px;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
                You're on the list.
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:rgba(255,255,255,0.45);line-height:1.6;">
                Thanks for joining the Swish waitlist. We're building the AI platform that helps small businesses compete with the big players — and you'll be among the first to get access.
              </p>

              <!-- Divider -->
              <div style="height:1px;background:rgba(255,255,255,0.06);margin:0 0 28px;"></div>

              <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.25);">
                What to expect
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <span style="font-size:14px;color:rgba(255,255,255,0.55);">🏪</span>
                    <span style="font-size:14px;color:rgba(255,255,255,0.55);margin-left:10px;">Early access to the AI store builder</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <span style="font-size:14px;color:rgba(255,255,255,0.55);">📊</span>
                    <span style="font-size:14px;color:rgba(255,255,255,0.55);margin-left:10px;">Actionable analytics from day one</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:14px;color:rgba(255,255,255,0.55);">🤖</span>
                    <span style="font-size:14px;color:rgba(255,255,255,0.55);margin-left:10px;">Your own autonomous AI agents</span>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.3);line-height:1.6;">
                We'll reach out to <span style="color:rgba(139,92,246,0.9);">${email}</span> when your spot is ready. In the meantime, feel free to reply to this email with any questions.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);line-height:1.5;">
                © 2025 Swish · You're receiving this because you signed up at swish.app.<br>
                <a href="#" style="color:rgba(139,92,246,0.6);text-decoration:none;">Unsubscribe</a>
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
  },
});
