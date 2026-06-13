import { Loader2 } from "lucide-react"
import { lazy, Suspense, type ComponentType } from "react"
import { Navigate, useParams } from "react-router-dom"

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

export function Level() {
  const { levelId } = useParams<{ levelId: string }>()

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
    <Suspense
      fallback={
        <div className="flex h-[calc(100svh-4rem)] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LevelComponent />
    </Suspense>
  )
}
