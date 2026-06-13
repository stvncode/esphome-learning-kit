import { AuthBackground } from "@/components/auth/AuthBackground"
import { LoginForm } from "@/components/auth/LoginForm"
import { ArrowLeft, Cpu } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

export function SignIn() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get("invite") ?? undefined

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
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-cyan-400">
            <Cpu className="h-3.5 w-3.5 text-white" />
          </div>
          ESPHome Learn
        </Link>
        <LoginForm
          inviteToken={inviteToken}
          onSwitchToSignup={() => navigate(inviteToken ? `/signup?invite=${inviteToken}` : "/signup")}
        />
        <p className="px-6 text-center text-[11px] text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">Terms</a>
          {" "}and{" "}
          <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
