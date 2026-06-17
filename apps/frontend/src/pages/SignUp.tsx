import { AuthBackground } from "@/components/auth/AuthBackground"
import { SignupForm } from "@/components/auth/SignupForm"
import { acceptInvite, getInviteInfo } from "@/lib/api"
import { useSession } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, GraduationCap, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

export function SignUp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get("invite") ?? undefined
  const { data: session, isPending: sessionPending } = useSession()
  const accepting = useRef(false)
  // True once the session check has settled at least once. Sign-up triggers a
  // session refetch (flipping `sessionPending` back to true), and we must NOT
  // tear the form down for that — doing so drops the in-progress verify step.
  const [sessionSettled, setSessionSettled] = useState(false)
  useEffect(() => {
    if (!sessionPending) setSessionSettled(true)
  }, [sessionPending])

  // Look up the invite so we can show the class name and lock the email.
  const { data: invite, isLoading: inviteLoading } = useQuery({
    queryKey: ["invite", inviteToken],
    queryFn: () => getInviteInfo(inviteToken!),
    enabled: !!inviteToken,
    retry: false,
  })

  // Already signed in + has an invite → just join the class (existing-user auto-join).
  useEffect(() => {
    if (!inviteToken || sessionPending || !session || accepting.current) return
    accepting.current = true
    acceptInvite(inviteToken)
      .then(() => {
        toast.success("You've joined the class!")
        navigate("/app/classes", { replace: true })
      })
      .catch((e: Error) => toast.error(e.message))
  }, [inviteToken, session, sessionPending, navigate])

  // Show the spinner when an invited user is already signed in (the effect
  // above auto-joins them), or on the very first session check before we know.
  // Once settled, keep the form mounted through later refetches.
  if (inviteToken && (session || (sessionPending && !sessionSettled))) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-background p-6 md:p-10">
      <AuthBackground />
      <Link
        to="/"
        className="absolute left-6 top-6 z-10 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium text-foreground">
          <img src="/esp32.png" className="h-10 w-10" />
          ESPHome Learning
        </Link>

        {inviteToken && invite && (
          <div className="flex items-center gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-4 py-3">
            <GraduationCap className="h-5 w-5 shrink-0 text-cyan-400" />
            <p className="text-sm text-muted-foreground">
              You've been invited to join{" "}
              <span className="font-medium text-foreground">{invite.classroomName}</span>. Create
              your account to get started.
            </p>
          </div>
        )}
        {inviteToken && !invite && !inviteLoading && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
            This invite link is invalid or has already been used. You can still create an account
            below.
          </div>
        )}

        <SignupForm
          onSwitchToLogin={() =>
            navigate(inviteToken ? `/signin?invite=${inviteToken}` : "/signin")
          }
          inviteToken={inviteToken}
          lockedEmail={invite?.email}
        />
        <p className="px-6 text-center text-[11px] text-muted-foreground">
          By continuing, you agree to our{" "}
          <a
            href="#"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}
