import { z } from "zod";

/** Health check response from the backend. */
export const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;

/** Credentials for email + password sign in. */
export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});
export type SignInInput = z.infer<typeof signInSchema>;

/** Payload for creating an account with email + password. */
export const signUpSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email(),
    password: z.string().min(8, "Must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignUpInput = z.infer<typeof signUpSchema>;

/** A single unlocked achievement. */
export const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  unlockedAt: z.string().optional(),
});
export type Achievement = z.infer<typeof achievementSchema>;

/** A user's learning progress, persisted server-side. */
export const progressSchema = z.object({
  completedLevels: z.array(z.string()),
  currentLevel: z.string().nullable(),
  streak: z.number().int(),
  lastActivityDate: z.string().nullable(),
  achievements: z.array(achievementSchema),
});
export type Progress = z.infer<typeof progressSchema>;

export const projectKindSchema = z.enum(["workspace", "sandbox"]);
export type ProjectKind = z.infer<typeof projectKindSchema>;

/** A saved builder/sandbox project. `data` holds the kind-specific payload. */
export const projectSchema = z.object({
  id: z.string(),
  kind: projectKindSchema,
  name: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof projectSchema>;

export const projectListSchema = z.array(projectSchema);

/** Payload to create/update a project (upserted by kind + name). */
export const projectUpsertSchema = z.object({
  kind: projectKindSchema,
  name: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});
export type ProjectUpsertInput = z.infer<typeof projectUpsertSchema>;

/** Authenticated user as returned by the auth provider. */
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof userSchema>;
