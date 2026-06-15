import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldDescription, FieldGroup } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { authClient } from "@/lib/auth-client"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface VerifyEmailCardProps {
  email: string
  /** Runs after the code is accepted — the parent signs the user in and navigates. */
  onVerified: () => void | Promise<void>
  onBack: () => void
}

/** Shared OTP step: verifies the 6-digit code, then hands off to `onVerified`. */
export function VerifyEmailCard({ email, onVerified, onBack }: VerifyEmailCardProps) {
  const [otp, setOtp] = useState("")

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const { error } = await authClient.emailOtp.verifyEmail({ email, otp: code })
      if (error) throw new Error(error.message ?? "Invalid or expired code")
      await onVerified()
    },
    onError: (error: Error) => {
      setOtp("")
      toast.error(error.message)
    },
  })

  const resendMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      })
      if (error) throw new Error(error.message ?? "Unable to resend code")
    },
    onSuccess: () => toast.success("A new code is on its way"),
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <Card className="border-border bg-card shadow-none">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">Verify your email</CardTitle>
        <CardDescription>
          Enter the 6-digit code we sent to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (otp.length === 6) verifyMutation.mutate(otp)
          }}
        >
          <FieldGroup>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                onComplete={(code) => verifyMutation.mutate(code)}
                disabled={verifyMutation.isPending}
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={otp.length !== 6 || verifyMutation.isPending}
            >
              {verifyMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify & continue
            </Button>
            <FieldDescription className="text-center">
              Didn't get a code?{" "}
              <button
                type="button"
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="underline underline-offset-2 hover:text-foreground transition-colors disabled:opacity-50"
              >
                Resend
              </button>
            </FieldDescription>
            <button
              type="button"
              onClick={onBack}
              className="mx-auto flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
