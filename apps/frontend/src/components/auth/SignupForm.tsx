import { VerifyEmailCard } from "@/components/auth/VerifyEmailCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { acceptInvite } from "@/lib/api"
import { authClient, signIn, signUp } from "@/lib/auth-client"
import { signUpSchema } from "@esphome-learning-kit/types"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface SignupFormProps extends React.ComponentProps<"div"> {
  onSwitchToLogin?: () => void
  /** When present, the new account is enrolled in the invited class as a student. */
  inviteToken?: string
  /** Pre-filled, read-only email (from an invite). */
  lockedEmail?: string
}

export function SignupForm({ onSwitchToLogin, inviteToken, lockedEmail }: SignupFormProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<"details" | "verify">("details")
  const [name, setName] = useState("")
  const [email, setEmail] = useState(lockedEmail ?? "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Step 1: create the account (no session yet — autoSignIn is off) and email a code.
  const signupMutation = useMutation({
    mutationFn: async () => {
      const payload = signUpSchema.parse({ name, email, password, confirmPassword })
      const { error } = await signUp.email({
        name: payload.name,
        email: payload.email,
        password: payload.password,
      })
      if (error) throw new Error(error.message ?? "Unable to create account")
      const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
        email: payload.email,
        type: "email-verification",
      })
      if (otpError) throw new Error(otpError.message ?? "Unable to send verification code")
    },
    onSuccess: () => {
      setStep("verify")
      toast.success("We sent a verification code to your email")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // Step 2 hand-off: the email is verified, so sign in and accept any invite.
  const finishSignup = async () => {
    const { error } = await signIn.email({ email, password })
    if (error) throw new Error(error.message ?? "Unable to sign in")
    if (inviteToken) {
      await acceptInvite(inviteToken)
      toast.success("Account created — you've joined the class!")
      navigate("/app/classes", { replace: true })
    } else {
      toast.success("Account created!")
      navigate("/app", { replace: true })
    }
  }

  if (step === "verify") {
    return (
      <VerifyEmailCard
        email={email}
        onVerified={finishSignup}
        onBack={() => setStep("details")}
      />
    )
  }

  return (
    <Card className="border-border bg-card shadow-none">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>Enter your details below to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            signupMutation.mutate()
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="signup-name">Full Name</FieldLabel>
              <Input
                id="signup-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-email">Email</FieldLabel>
              <Input
                id="signup-email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!!lockedEmail}
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="signup-confirm">Confirm</FieldLabel>
                <Input
                  id="signup-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Field>
            </div>
            <FieldDescription>Must be at least 8 characters long.</FieldDescription>
            <Button type="submit" className="w-full" disabled={signupMutation.isPending}>
              {signupMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            <FieldDescription className="text-center">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Sign in
              </button>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
