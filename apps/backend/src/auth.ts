import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index.ts";
import * as schema from "./db/schema.ts";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // No email provider wired yet — log the reset link for local dev.
      // Swap this for a real mailer (Resend/SES/etc.) in production.
      console.log(`[auth] Password reset for ${user.email}: ${url}`);
    },
  },
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",").map((o) => o.trim()) ?? [
    "http://localhost:5173",
  ],
});
