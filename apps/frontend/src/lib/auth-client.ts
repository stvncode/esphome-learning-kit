import { emailOTPClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { API_URL } from "./api"

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [emailOTPClient()],
})

export const { signIn, signUp, signOut, useSession } = authClient

export type UserRole = "teacher" | "student"

/** The current user's global role (teacher can create classes; student cannot). */
export function useRole(): UserRole | undefined {
  const { data } = useSession()
  return (data?.user as { role?: UserRole } | undefined)?.role
}
