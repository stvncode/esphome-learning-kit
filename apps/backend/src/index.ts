import { healthResponseSchema } from "@esphome-learning-kit/types";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { api } from "./api.ts";
import { auth } from "./auth.ts";
import { db } from "./db/index.ts";
import { classroom, classroomInvite } from "./db/schema.ts";

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

// Public: look up an invite by token (used by the signup page). Registered
// before the gated /api router so it isn't caught by the auth middleware.
app.get("/api/invites/:token", async (c) => {
  const token = c.req.param("token");
  const [invite] = await db
    .select({
      email: classroomInvite.email,
      acceptedAt: classroomInvite.acceptedAt,
      classroomName: classroom.name,
    })
    .from(classroomInvite)
    .innerJoin(classroom, eq(classroom.id, classroomInvite.classroomId))
    .where(eq(classroomInvite.token, token));
  if (!invite || invite.acceptedAt) {
    return c.json({ error: "Invalid or used invite" }, 404);
  }
  return c.json({ classroomName: invite.classroomName, email: invite.email });
});

// Authenticated app data (progress, projects, classrooms).
app.route("/api", api);

app.get("/", (c) => c.text("backend"));

const port = Number(process.env.PORT) || 3001;
console.log(`backend listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
