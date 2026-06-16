import { VerifyEmailCard } from "@/components/auth/VerifyEmailCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { acceptInvite } from "@/lib/api"
import { authClient, signIn } from "@/lib/auth-client"
import { signInSchema } from "@esphome-learning-kit/types"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface LoginFormProps extends React.ComponentProps<"div"> {
  onSwitchToSignup?: () => void
  /** When present, the user is enrolled in the invited class after signing in. */
  inviteToken?: string
}

export function LoginForm({ onSwitchToSignup, inviteToken }: LoginFormProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState<"credentials" | "verify">("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/app"

  // Land in the app once a session exists (after sign-in, or after verifying).
  const finishLogin = async () => {
    // The session cookie is cross-site (frontend and backend are different
    // origins), so force a fresh session fetch before navigating — otherwise
    // ProtectedRoute can read a stale null and bounce back to /signin.
    await authClient.getSession({ query: { disableCookieCache: true } })
    if (inviteToken) {
      await acceptInvite(inviteToken)
      toast.success("You've joined the class!")
      navigate("/app/classes", { replace: true })
    } else {
      navigate(redirectTo, { replace: true })
    }
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const credentials = signInSchema.parse({ email, password })
      const { error } = await signIn.email(credentials)
      if (error) {
        // Account exists but the email was never verified — send a fresh code
        // and route to the OTP step instead of failing outright.
        if ((error as { code?: string }).code === "EMAIL_NOT_VERIFIED") {
          const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
            email,
            type: "email-verification",
          })
          if (otpError) throw new Error(otpError.message ?? "Unable to send verification code")
          return { needsVerification: true as const }
        }
        throw new Error(error.message ?? "Unable to sign in")
      }
      await finishLogin()
      return { needsVerification: false as const }
    },
    onSuccess: (result) => {
      if (result.needsVerification) {
        setStep("verify")
        toast.info("Please verify your email — we sent you a code")
      }
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // After the code is accepted the email is verified, so signing in now succeeds.
  const finishAfterVerify = async () => {
    const { error } = await signIn.email({ email, password })
    if (error) throw new Error(error.message ?? "Unable to sign in")
    await finishLogin()
  }

  if (step === "verify") {
    return (
      <VerifyEmailCard
        email={email}
        onVerified={finishAfterVerify}
        onBack={() => setStep("credentials")}
      />
    )
  }

  return (
    <Card className="border-border bg-card shadow-none">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate()
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input
                id="login-email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="login-password">Password</FieldLabel>
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            <FieldDescription className="text-center">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Create one
              </button>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
