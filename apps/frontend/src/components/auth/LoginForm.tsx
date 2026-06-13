import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signIn } from "@/lib/auth-client"
import { signInSchema } from "@esphome-learning-kit/types"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface LoginFormProps extends React.ComponentProps<"div"> {
  onSwitchToSignup?: () => void
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/app"

  const mutation = useMutation({
    mutationFn: async () => {
      const credentials = signInSchema.parse({ email, password })
      const { error } = await signIn.email(credentials)
      if (error) throw new Error(error.message ?? "Unable to sign in")
    },
    onSuccess: () => {
      toast.success("Welcome back!")
      navigate(redirectTo, { replace: true })
    },
    onError: (error: Error) => toast.error(error.message),
  })

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
