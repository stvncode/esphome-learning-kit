import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, Cpu, Loader2 } from "lucide-react"
import { useState } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  const mutation = useMutation({
    mutationFn: async () => {
      if (password.length < 8) throw new Error("Must be at least 8 characters long")
      if (password !== confirm) throw new Error("Passwords do not match")
      const { error } = await authClient.resetPassword({ newPassword: password, token: token! })
      if (error) throw new Error(error.message ?? "Unable to reset password")
    },
    onSuccess: () => {
      toast.success("Password updated — please sign in")
      navigate("/signin", { replace: true })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // No token → the link is invalid; send the user to request a fresh one.
  if (!token) {
    return <Navigate to="/forgot-password" replace />
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <Link
        to="/signin"
        className="absolute left-6 top-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium text-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-cyan-400">
            <Cpu className="h-3.5 w-3.5 text-white" />
          </div>
          ESPHome Learn
        </Link>

        <Card className="border-border bg-card shadow-none">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Choose a new password</CardTitle>
            <CardDescription>Enter and confirm your new password below</CardDescription>
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
                  <FieldLabel htmlFor="reset-password">New password</FieldLabel>
                  <Input
                    id="reset-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="reset-confirm">Confirm password</FieldLabel>
                  <Input
                    id="reset-confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </Field>
                <FieldDescription>Must be at least 8 characters long.</FieldDescription>
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update password
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
