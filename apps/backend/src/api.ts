import {
  progressSchema,
  projectKindSchema,
  projectUpsertSchema,
} from "@esphome-learning-kit/types";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { auth } from "./auth.ts";
import { db } from "./db/index.ts";
import { progress, project } from "./db/schema.ts";

type Variables = {
  userId: string;
};

export const api = new Hono<{ Variables: Variables }>();

// Require an authenticated session for every /api route below.
api.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("userId", session.user.id);
  await next();
});

// ── Progress ────────────────────────────────────────────────────────────────

const DEFAULT_PROGRESS = {
  completedLevels: [] as string[],
  currentLevel: null,
  streak: 1,
  lastActivityDate: null,
  achievements: [],
};

api.get("/progress", async (c) => {
  const userId = c.get("userId");
  const [row] = await db.select().from(progress).where(eq(progress.userId, userId));
  if (!row) {
    return c.json(DEFAULT_PROGRESS);
  }
  return c.json({
    completedLevels: row.completedLevels,
    currentLevel: row.currentLevel,
    streak: row.streak,
    lastActivityDate: row.lastActivityDate,
    achievements: row.achievements,
  });
});

api.put("/progress", async (c) => {
  const userId = c.get("userId");
  const parsed = progressSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: "Invalid progress payload" }, 400);
  }
  const value = { userId, ...parsed.data, updatedAt: new Date() };
  await db
    .insert(progress)
    .values(value)
    .onConflictDoUpdate({ target: progress.userId, set: value });
  return c.json(parsed.data);
});

// ── Projects ──────────────────────────────────────────────────────────────────

const serializeProject = (row: typeof project.$inferSelect) => ({
  id: row.id,
  kind: row.kind,
  name: row.name,
  data: row.data,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

api.get("/projects", async (c) => {
  const userId = c.get("userId");
  const kind = projectKindSchema.safeParse(c.req.query("kind"));
  if (!kind.success) {
    return c.json({ error: "Invalid or missing kind" }, 400);
  }
  const rows = await db
    .select()
    .from(project)
    .where(and(eq(project.userId, userId), eq(project.kind, kind.data)));
  return c.json(rows.map(serializeProject));
});

api.put("/projects", async (c) => {
  const userId = c.get("userId");
  const parsed = projectUpsertSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: "Invalid project payload" }, 400);
  }
  const now = new Date();
  const [row] = await db
    .insert(project)
    .values({
      id: crypto.randomUUID(),
      userId,
      kind: parsed.data.kind,
      name: parsed.data.name,
      data: parsed.data.data,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [project.userId, project.kind, project.name],
      set: { data: parsed.data.data, updatedAt: now },
    })
    .returning();
  return c.json(serializeProject(row));
});

api.delete("/projects", async (c) => {
  const userId = c.get("userId");
  const kind = projectKindSchema.safeParse(c.req.query("kind"));
  const name = c.req.query("name");
  if (!kind.success || !name) {
    return c.json({ error: "Invalid or missing kind/name" }, 400);
  }
  await db
    .delete(project)
    .where(
      and(
        eq(project.userId, userId),
        eq(project.kind, kind.data),
        eq(project.name, name),
      ),
    );
  return c.json({ success: true });
});
