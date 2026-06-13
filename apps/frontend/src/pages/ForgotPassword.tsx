import { AuthBackground } from "@/components/auth/AuthBackground"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, CheckCircle2, Cpu, Loader2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

export function ForgotPassword() {
  const [email, setEmail] = useState("")

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw new Error(error.message ?? "Unable to send reset email")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-background p-6 md:p-10">
      <AuthBackground />
      <Link
        to="/signin"
        className="absolute left-6 top-6 z-10 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium text-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-cyan-400">
            <Cpu className="h-3.5 w-3.5 text-white" />
          </div>
          ESPHome Learn
        </Link>

        <Card className="border-border bg-card shadow-none">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Reset your password</CardTitle>
            <CardDescription>
              {mutation.isSuccess
                ? "Check your inbox for a reset link"
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mutation.isSuccess ? (
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <p className="text-sm text-muted-foreground">
                  If an account exists for <span className="font-medium text-foreground">{email}</span>,
                  a password reset link is on its way.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  mutation.mutate()
                }}
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Field>
                  <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Send reset link
                  </Button>
                </FieldGroup>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
