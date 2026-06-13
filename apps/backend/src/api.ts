import {
  createClassroomSchema,
  joinClassroomSchema,
  progressSchema,
  projectKindSchema,
  projectUpsertSchema,
  quizScoreUpsertSchema,
} from "@esphome-learning-kit/types";
import { and, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { auth } from "./auth.ts";
import { db } from "./db/index.ts";
import {
  classroom,
  classroomMember,
  progress,
  project,
  quizScore,
  user,
} from "./db/schema.ts";
import { buildStandings, generateCode } from "./standings.ts";

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
  onboarded: false,
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
    onboarded: row.onboarded,
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

// ── Quiz scores ───────────────────────────────────────────────────────────────

api.get("/quiz-scores", async (c) => {
  const userId = c.get("userId");
  const rows = await db.select().from(quizScore).where(eq(quizScore.userId, userId));
  return c.json(
    rows.map((r) => ({
      levelId: r.levelId,
      score: r.score,
      total: r.total,
      updatedAt: r.updatedAt.toISOString(),
    })),
  );
});

api.put("/quiz-scores", async (c) => {
  const userId = c.get("userId");
  const parsed = quizScoreUpsertSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: "Invalid quiz score payload" }, 400);
  }
  const { levelId, score, total } = parsed.data;
  if (score > total) {
    return c.json({ error: "score cannot exceed total" }, 400);
  }
  const now = new Date();
  await db
    .insert(quizScore)
    .values({ id: crypto.randomUUID(), userId, levelId, score, total, updatedAt: now })
    .onConflictDoUpdate({
      target: [quizScore.userId, quizScore.levelId],
      set: { score, total, updatedAt: now },
      // Only keep the result if it's at least as good as the stored one
      // (compare fractions via cross-multiplication to avoid floats).
      setWhere: sql`${quizScore.score} * ${total} <= ${score} * ${quizScore.total}`,
    });
  return c.json(parsed.data);
});

// ── Classrooms ──────────────────────────────────────────────────────────────────

async function memberCountFor(classroomId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(classroomMember)
    .where(eq(classroomMember.classroomId, classroomId));
  return row?.count ?? 0;
}

api.post("/classrooms", async (c) => {
  const userId = c.get("userId");
  const parsed = createClassroomSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: "Invalid classroom payload" }, 400);
  }
  // Retry a few times in the unlikely event of a code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    try {
      const now = new Date();
      const [row] = await db
        .insert(classroom)
        .values({ id: crypto.randomUUID(), name: parsed.data.name, code, ownerId: userId, createdAt: now })
        .returning();
      return c.json({
        id: row.id,
        name: row.name,
        code: row.code,
        role: "teacher" as const,
        memberCount: 0,
        createdAt: row.createdAt.toISOString(),
      });
    } catch {
      // likely a unique-code collision — try again with a new code
    }
  }
  return c.json({ error: "Could not generate a unique class code" }, 500);
});

api.get("/classrooms", async (c) => {
  const userId = c.get("userId");

  const owned = await db.select().from(classroom).where(eq(classroom.ownerId, userId));
  const joined = await db
    .select({ classroom })
    .from(classroomMember)
    .innerJoin(classroom, eq(classroom.id, classroomMember.classroomId))
    .where(eq(classroomMember.userId, userId));

  const result = [];
  for (const room of owned) {
    result.push({
      id: room.id,
      name: room.name,
      code: room.code,
      role: "teacher" as const,
      memberCount: await memberCountFor(room.id),
      createdAt: room.createdAt.toISOString(),
    });
  }
  for (const { classroom: room } of joined) {
    result.push({
      id: room.id,
      name: room.name,
      code: room.code,
      role: "student" as const,
      memberCount: await memberCountFor(room.id),
      createdAt: room.createdAt.toISOString(),
    });
  }
  return c.json(result);
});

api.post("/classrooms/join", async (c) => {
  const userId = c.get("userId");
  const parsed = joinClassroomSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: "Invalid join payload" }, 400);
  }
  const [room] = await db
    .select()
    .from(classroom)
    .where(eq(classroom.code, parsed.data.code.trim().toUpperCase()));
  if (!room) {
    return c.json({ error: "No class found for that code" }, 404);
  }
  if (room.ownerId === userId) {
    return c.json({ error: "You own this class" }, 400);
  }
  await db
    .insert(classroomMember)
    .values({ id: crypto.randomUUID(), classroomId: room.id, userId, joinedAt: new Date() })
    .onConflictDoNothing();
  return c.json({
    id: room.id,
    name: room.name,
    code: room.code,
    role: "student" as const,
    memberCount: await memberCountFor(room.id),
    createdAt: room.createdAt.toISOString(),
  });
});

api.get("/classrooms/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const [room] = await db.select().from(classroom).where(eq(classroom.id, id));
  if (!room) return c.json({ error: "Class not found" }, 404);

  const isOwner = room.ownerId === userId;
  const [membership] = isOwner
    ? [null]
    : await db
        .select()
        .from(classroomMember)
        .where(and(eq(classroomMember.classroomId, id), eq(classroomMember.userId, userId)));
  if (!isOwner && !membership) {
    return c.json({ error: "Not a member of this class" }, 403);
  }

  // Members (students) + their progress + quiz averages → leaderboard standings.
  const members = await db
    .select({ userId: classroomMember.userId, name: user.name })
    .from(classroomMember)
    .innerJoin(user, eq(user.id, classroomMember.userId))
    .where(eq(classroomMember.classroomId, id));

  const memberIds = members.map((m) => m.userId);
  const progressRows = memberIds.length
    ? await db.select().from(progress).where(inArray(progress.userId, memberIds))
    : [];
  const quizRows = memberIds.length
    ? await db.select().from(quizScore).where(inArray(quizScore.userId, memberIds))
    : [];

  const standings = buildStandings(members, progressRows, quizRows);

  return c.json({
    id: room.id,
    name: room.name,
    code: room.code,
    role: isOwner ? "teacher" : "student",
    createdAt: room.createdAt.toISOString(),
    members: standings,
  });
});

api.delete("/classrooms/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const [room] = await db.select().from(classroom).where(eq(classroom.id, id));
  if (!room) return c.json({ error: "Class not found" }, 404);
  if (room.ownerId !== userId) return c.json({ error: "Only the teacher can delete this class" }, 403);
  await db.delete(classroom).where(eq(classroom.id, id));
  return c.json({ success: true });
});

api.post("/classrooms/:id/leave", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  await db
    .delete(classroomMember)
    .where(and(eq(classroomMember.classroomId, id), eq(classroomMember.userId, userId)));
  return c.json({ success: true });
});

/** Resolve a class the current user must own, or return the error response. */
async function requireOwnedClass(c: { get: (k: "userId") => string; req: { param: (k: string) => string } }) {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const [room] = await db.select().from(classroom).where(eq(classroom.id, id));
  if (!room) return { error: "Class not found" as const, status: 404 as const };
  if (room.ownerId !== userId) return { error: "Only the teacher can do that" as const, status: 403 as const };
  return { room };
}

api.patch("/classrooms/:id", async (c) => {
  const owned = await requireOwnedClass(c);
  if ("error" in owned) return c.json({ error: owned.error }, owned.status);
  const parsed = createClassroomSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid name" }, 400);
  await db.update(classroom).set({ name: parsed.data.name }).where(eq(classroom.id, owned.room.id));
  return c.json({ success: true });
});

api.delete("/classrooms/:id/members/:userId", async (c) => {
  const owned = await requireOwnedClass(c);
  if ("error" in owned) return c.json({ error: owned.error }, owned.status);
  const memberId = c.req.param("userId");
  await db
    .delete(classroomMember)
    .where(and(eq(classroomMember.classroomId, owned.room.id), eq(classroomMember.userId, memberId)));
  return c.json({ success: true });
});

api.get("/classrooms/:id/members/:userId", async (c) => {
  const owned = await requireOwnedClass(c);
  if ("error" in owned) return c.json({ error: owned.error }, owned.status);
  const memberId = c.req.param("userId");

  const [membership] = await db
    .select({ name: user.name })
    .from(classroomMember)
    .innerJoin(user, eq(user.id, classroomMember.userId))
    .where(and(eq(classroomMember.classroomId, owned.room.id), eq(classroomMember.userId, memberId)));
  if (!membership) return c.json({ error: "Not a member of this class" }, 404);

  const [prog] = await db.select().from(progress).where(eq(progress.userId, memberId));
  const quizzes = await db.select().from(quizScore).where(eq(quizScore.userId, memberId));

  return c.json({
    userId: memberId,
    name: membership.name,
    completedLevels: prog?.completedLevels ?? [],
    achievementCount: prog?.achievements.length ?? 0,
    quizScores: quizzes.map((q) => ({ levelId: q.levelId, score: q.score, total: q.total })),
  });
});
