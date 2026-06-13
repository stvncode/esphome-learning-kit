import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signUp } from "@/lib/auth-client"
import { signUpSchema } from "@esphome-learning-kit/types"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface SignupFormProps extends React.ComponentProps<"div"> {
  onSwitchToLogin?: () => void
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = signUpSchema.parse({ name, email, password, confirmPassword })
      const { error } = await signUp.email({
        name: payload.name,
        email: payload.email,
        password: payload.password,
      })
      if (error) throw new Error(error.message ?? "Unable to create account")
    },
    onSuccess: () => {
      toast.success("Account created!")
      navigate("/app", { replace: true })
    },
    onError: (error: Error) => toast.error(error.message),
  })

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
            mutation.mutate()
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
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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
