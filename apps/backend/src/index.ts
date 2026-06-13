import { healthResponseSchema } from "@esphome-learning-kit/types";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { api } from "./api.ts";
import { auth } from "./auth.ts";

const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(",").map((o) => o.trim()) ?? [
  "http://localhost:5173",
];

const app = new Hono();

app.use(
  "*",
  cors({
    origin: trustedOrigins,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// Mount better-auth — handles all /api/auth/** routes.
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/api/health", (c) => c.json(healthResponseSchema.parse({ status: "ok" })));

// Authenticated app data (progress, projects).
app.route("/api", api);

app.get("/", (c) => c.text("backend"));

const port = 3001;
console.log(`backend listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
