import { describe, expect, test } from "bun:test";
import {
  progressSchema,
  projectUpsertSchema,
  signUpSchema,
} from "./index.ts";

describe("signUpSchema", () => {
  const base = {
    name: "Ada",
    email: "ada@example.com",
    password: "supersecret",
    confirmPassword: "supersecret",
  };

  test("accepts a valid signup", () => {
    expect(signUpSchema.safeParse(base).success).toBe(true);
  });

  test("rejects mismatched passwords", () => {
    const result = signUpSchema.safeParse({ ...base, confirmPassword: "different" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  test("rejects short passwords", () => {
    const result = signUpSchema.safeParse({ ...base, password: "short", confirmPassword: "short" });
    expect(result.success).toBe(false);
  });

  test("rejects invalid emails", () => {
    expect(signUpSchema.safeParse({ ...base, email: "not-an-email" }).success).toBe(false);
  });
});

describe("progressSchema", () => {
  test("parses a full progress object", () => {
    const result = progressSchema.safeParse({
      completedLevels: ["1.1", "1.2"],
      currentLevel: "1.3",
      streak: 4,
      lastActivityDate: "Sat Jun 13 2026",
      achievements: [{ id: "first-steps", title: "First", description: "d", icon: "🎯" }],
    });
    expect(result.success).toBe(true);
  });

  test("allows null currentLevel and empty arrays", () => {
    expect(
      progressSchema.safeParse({
        completedLevels: [],
        currentLevel: null,
        streak: 1,
        lastActivityDate: null,
        achievements: [],
      }).success,
    ).toBe(true);
  });

  test("rejects a non-integer streak", () => {
    const result = progressSchema.safeParse({
      completedLevels: [],
      currentLevel: null,
      streak: 1.5,
      lastActivityDate: null,
      achievements: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("projectUpsertSchema", () => {
  test("accepts workspace/sandbox kinds with arbitrary data", () => {
    expect(
      projectUpsertSchema.safeParse({ kind: "sandbox", name: "p1", data: { nodes: [], edges: [] } })
        .success,
    ).toBe(true);
  });

  test("rejects an unknown kind", () => {
    expect(
      projectUpsertSchema.safeParse({ kind: "firmware", name: "p1", data: {} }).success,
    ).toBe(false);
  });

  test("rejects an empty name", () => {
    expect(
      projectUpsertSchema.safeParse({ kind: "workspace", name: "", data: {} }).success,
    ).toBe(false);
  });
});
