import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index.ts";
import * as schema from "./db/schema.ts";

/**
 * Send a password-reset email via Resend if configured; otherwise log the link
 * (local dev). Uses fetch directly so there's no SDK dependency.
 */
async function sendResetEmail(email: string, url: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.log(`[auth] Password reset for ${email}: ${url}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Reset your ESPHome Learn password",
      html: `<p>We received a request to reset your password.</p>
<p><a href="${url}">Click here to choose a new password</a>.</p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
    }),
  });
  if (!res.ok) {
    console.error(`[auth] Resend failed (${res.status}). Reset link: ${url}`);
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetEmail(user.email, url);
    },
  },
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",").map((o) => o.trim()) ?? [
    "http://localhost:5173",
  ],
});
