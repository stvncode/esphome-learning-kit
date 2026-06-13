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
