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

export const send = action({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (_ctx, { name, email, subject, message }) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanMessage) {
      throw new Error("Please fill in your name and message.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error("Invalid email address.");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Swish Contact <hello@swish.app>",
      to: "swishappdev@gmail.com",
      replyTo: cleanEmail,
      subject: `[Contact] ${subject} — ${cleanName}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf9fa;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9fa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e3e2e3;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #efedee;">
              <span style="font-size:20px;font-weight:700;color:#094cb2;letter-spacing:-0.5px;">Swish</span>
              <p style="margin:8px 0 0;font-size:13px;color:#434653;">New contact inquiry</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:8px 0;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#737784;width:96px;vertical-align:top;">From</td>
                  <td style="padding:8px 0;font-size:14px;color:#1b1c1d;">${escapeHtml(cleanName)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#737784;vertical-align:top;">Email</td>
                  <td style="padding:8px 0;font-size:14px;color:#1b1c1d;"><a href="mailto:${escapeHtml(cleanEmail)}" style="color:#094cb2;text-decoration:none;">${escapeHtml(cleanEmail)}</a></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#737784;vertical-align:top;">Subject</td>
                  <td style="padding:8px 0;font-size:14px;color:#1b1c1d;">${escapeHtml(subject)}</td>
                </tr>
              </table>

              <div style="height:1px;background:#efedee;margin:24px 0;"></div>

              <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#737784;">Message</p>
              <p style="margin:0;font-size:14px;color:#1b1c1d;line-height:1.6;white-space:pre-wrap;">${escapeHtml(cleanMessage)}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #efedee;">
              <p style="margin:0;font-size:12px;color:#737784;line-height:1.5;">
                Reply directly to this email to respond to ${escapeHtml(cleanName)}.
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
