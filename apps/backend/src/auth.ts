import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index.ts";
import * as schema from "./db/schema.ts";
import { sendEmail } from "./email.ts";

// When the backend runs on HTTPS (production), the frontend and backend are on
// different sites, so the session cookie must be cross-site capable:
// SameSite=None requires Secure. Locally (http) we keep Lax so cookies still set.
const crossSite = (process.env.BETTER_AUTH_URL ?? "").startsWith("https://");

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  advanced: {
    defaultCookieAttributes: crossSite
      ? { sameSite: "none", secure: true }
      : { sameSite: "lax" },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    additionalFields: {
      // Public signups are teachers; invited students are set to "student"
      // server-side when they accept. Not client-settable (no privilege escalation).
      role: { type: "string", required: false, input: false, defaultValue: "teacher" },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your ESPHome Learn password",
        html: `<p>We received a request to reset your password.</p>
<p><a href="${url}">Click here to choose a new password</a>.</p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
        devNote: `Password reset link: ${url}`,
      });
    },
  },
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",").map((o) => o.trim()) ?? [
    "http://localhost:5173",
  ],
});
