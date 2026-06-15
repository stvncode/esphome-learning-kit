import { healthResponseSchema } from "@esphome-learning-kit/types";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { api } from "./api.ts";
import { auth } from "./auth.ts";
import { db } from "./db/index.ts";
import { classroom, classroomInvite } from "./db/schema.ts";
import { avatarKey, s3 } from "./storage.ts";

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

// Public: stream a user's avatar from R2. Registered before the gated /api
// router so <img> tags (which don't carry the session cookie) can load it.
app.get("/api/avatar/:userId", async (c) => {
  if (!s3) return c.json({ error: "Image storage is not configured" }, 500);
  const file = s3.file(avatarKey(c.req.param("userId")));
  if (!(await file.exists())) return c.json({ error: "Not found" }, 404);
  return new Response(file, {
    headers: {
      "Content-Type": file.type || "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
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
