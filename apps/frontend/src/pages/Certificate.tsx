import { Button } from "@/components/ui/button"
import { TOTAL_LEVELS } from "@/lib/achievements"
import { getProgress } from "@/lib/api"
import { useSession } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Cpu, Loader2, Printer } from "lucide-react"
import { Link } from "react-router-dom"

export function Certificate() {
  const { data: session } = useSession()
  const { data: progress, isLoading } = useQuery({ queryKey: ["progress"], queryFn: getProgress })

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const completed = progress?.completedLevels.length ?? 0
  const graduated = completed >= TOTAL_LEVELS
  const earnedAt = progress?.achievements.find((a) => a.id === "graduate")?.unlockedAt
  const dateLabel = earnedAt
    ? new Date(earnedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : ""

  if (!graduated) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <Cpu className="h-10 w-10 text-muted-foreground/40" />
        <div>
          <h1 className="text-xl font-semibold">Your certificate is almost ready</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete all {TOTAL_LEVELS} levels to unlock it — you're at {completed}/{TOTAL_LEVELS}.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/app">Keep learning</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background p-6 md:p-10">
      <div className="no-print mx-auto mb-6 flex max-w-3xl items-center justify-between">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to app
        </Link>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>

      <div className="print-area mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-2xl border-4 border-double border-cyan-500/40 bg-card px-8 py-14 text-center shadow-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,oklch(0.7_0.15_220_/_0.10),transparent)]" />
          <div className="relative space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
              <Cpu className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-500">
                Certificate of Completion
              </p>
              <h1 className="mt-4 text-lg text-muted-foreground">This certifies that</h1>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {session?.user?.name ?? "ESPHome Learner"}
              </p>
            </div>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
              has successfully completed all {TOTAL_LEVELS} levels of the ESPHome Learn curriculum —
              from visual flows and YAML through real-hardware workflows and advanced topics.
            </p>
            <div className="flex items-center justify-center gap-8 pt-4 text-sm">
              <div>
                <p className="font-semibold text-foreground">{dateLabel || "—"}</p>
                <p className="text-xs text-muted-foreground">Date</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="font-semibold text-foreground">ESPHome Learn</p>
                <p className="text-xs text-muted-foreground">Starter Kit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
