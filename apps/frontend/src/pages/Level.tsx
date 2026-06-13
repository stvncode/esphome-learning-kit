import { Button } from "@/components/ui/button"
import { LEVEL_ORDER, levelIndex, levelMeta, TOTAL_LEVELS } from "@/lib/curriculum"
import { useProgressStore } from "@/stores/progressStore"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { lazy, Suspense, useEffect, type ComponentType } from "react"
import { Link, Navigate, useParams } from "react-router-dom"

// Each level is code-split into its own chunk and only loaded when visited.
const levelComponents: Record<string, ComponentType> = {
  "1.1": lazy(() => import("@/components/levels/Level1_1").then((m) => ({ default: m.Level1_1 }))),
  "1.2": lazy(() => import("@/components/levels/Level1_2").then((m) => ({ default: m.Level1_2 }))),
  "1.3": lazy(() => import("@/components/levels/Level1_3").then((m) => ({ default: m.Level1_3 }))),
  "1.4": lazy(() => import("@/components/levels/Level1_4").then((m) => ({ default: m.Level1_4 }))),
  "2.1": lazy(() => import("@/components/levels/Level2_1").then((m) => ({ default: m.Level2_1 }))),
  "2.2": lazy(() => import("@/components/levels/Level2_2").then((m) => ({ default: m.Level2_2 }))),
  "2.3": lazy(() => import("@/components/levels/Level2_3").then((m) => ({ default: m.Level2_3 }))),
  "2.4": lazy(() => import("@/components/levels/Level2_4").then((m) => ({ default: m.Level2_4 }))),
  "3.1": lazy(() => import("@/components/levels/Level3_1").then((m) => ({ default: m.Level3_1 }))),
  "3.2": lazy(() => import("@/components/levels/Level3_2").then((m) => ({ default: m.Level3_2 }))),
  "3.3": lazy(() => import("@/components/levels/Level3_3").then((m) => ({ default: m.Level3_3 }))),
  "3.4": lazy(() => import("@/components/levels/Level3_4").then((m) => ({ default: m.Level3_4 }))),
  "3.5": lazy(() => import("@/components/levels/Level3_5").then((m) => ({ default: m.Level3_5 }))),
  "4.1": lazy(() => import("@/components/levels/Level4_1").then((m) => ({ default: m.Level4_1 }))),
  "4.2": lazy(() => import("@/components/levels/Level4_2").then((m) => ({ default: m.Level4_2 }))),
  "4.3": lazy(() => import("@/components/levels/Level4_3").then((m) => ({ default: m.Level4_3 }))),
  "4.4": lazy(() => import("@/components/levels/Level4_4").then((m) => ({ default: m.Level4_4 }))),
  "5.1": lazy(() => import("@/components/levels/Level5_1").then((m) => ({ default: m.Level5_1 }))),
  "5.2": lazy(() => import("@/components/levels/Level5_2").then((m) => ({ default: m.Level5_2 }))),
  "6.1": lazy(() => import("@/components/levels/Level6_1").then((m) => ({ default: m.Level6_1 }))),
  "6.2": lazy(() => import("@/components/levels/Level6_2").then((m) => ({ default: m.Level6_2 }))),
  "6.3": lazy(() => import("@/components/levels/Level6_3").then((m) => ({ default: m.Level6_3 }))),
}

function LevelNav({ levelId }: { levelId: string }) {
  const idx = levelIndex(levelId)
  if (idx === -1) return null
  const prev = LEVEL_ORDER[idx - 1]
  const next = LEVEL_ORDER[idx + 1]

  return (
    <div className="sticky top-16 z-10 flex items-center justify-between gap-2 border-b border-border/50 bg-background/80 px-6 py-2 backdrop-blur-sm">
      <Button asChild variant="ghost" size="sm" disabled={!prev} className="gap-1">
        {prev ? (
          <Link to={`/app/level/${prev.id}`}>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden truncate sm:inline">{prev.title}</span>
            <span className="sm:hidden">Prev</span>
          </Link>
        ) : (
          <span className="opacity-40">
            <ChevronLeft className="h-4 w-4" />
            Prev
          </span>
        )}
      </Button>

      <span className="shrink-0 text-xs font-medium text-muted-foreground">
        Level {idx + 1} of {TOTAL_LEVELS}
      </span>

      <Button asChild variant="ghost" size="sm" disabled={!next} className="gap-1">
        {next ? (
          <Link to={`/app/level/${next.id}`}>
            <span className="hidden truncate sm:inline">{next.title}</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="opacity-40">
            Next
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  )
}

export function Level() {
  const { levelId } = useParams<{ levelId: string }>()
  const setCurrentLevel = useProgressStore((s) => s.setCurrentLevel)

  // Remember the last level visited so the dashboard can offer "Continue".
  useEffect(() => {
    if (levelId && levelMeta(levelId)) setCurrentLevel(levelId)
  }, [levelId, setCurrentLevel])

  if (!levelId) {
    return <Navigate to="/" replace />
  }

  const LevelComponent = levelComponents[levelId]

  if (!LevelComponent) {
    return (
      <div className="flex h-[calc(100svh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold">Level {levelId}</h2>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <LevelNav levelId={levelId} />
      <Suspense
        fallback={
          <div className="flex h-[calc(100svh-8rem)] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <LevelComponent />
      </Suspense>
    </>
  )
}
