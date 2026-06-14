import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index.ts";
import * as schema from "./db/schema.ts";
import { sendEmail } from "./email.ts";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
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
