/**
 * Minimal mailer. Sends via Resend when RESEND_API_KEY + EMAIL_FROM are set;
 * otherwise logs to the console (handy for local dev). No SDK dependency.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  /** Shown in the console fallback — put the actionable link here. */
  devNote?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.log(`[email] to=${opts.to} :: ${opts.devNote ?? opts.subject}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
  });
  if (!res.ok) {
    console.error(`[email] Resend failed (${res.status}) for ${opts.to}. ${opts.devNote ?? ""}`);
  }
}

/** Public base URL of the frontend, used to build links in emails. */
export const appUrl = (): string =>
  process.env.APP_URL ??
  process.env.TRUSTED_ORIGINS?.split(",")[0]?.trim() ??
  "http://localhost:5173";
