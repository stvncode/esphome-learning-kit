import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { resumeLevel } from "@/lib/curriculum"
import { useProgressStore } from "@/stores/progressStore"
import { Code2, Cpu, Hammer, Lightbulb } from "lucide-react"
import { useNavigate } from "react-router-dom"

const STEPS = [
  { icon: Lightbulb, title: "Understand visually", desc: "Drag-and-drop flows show how smart devices work — no code to start." },
  { icon: Code2, title: "Reveal the code", desc: "See the real ESPHome YAML each block maps to." },
  { icon: Hammer, title: "Build it yourself", desc: "Write complete configs, then debug and connect to Home Assistant." },
  { icon: Cpu, title: "Export to ESPHome", desc: "Take your config to real hardware when you're ready." },
]

export function OnboardingDialog() {
  const loaded = useProgressStore((s) => s.loaded)
  const onboarded = useProgressStore((s) => s.onboarded)
  const completedLevels = useProgressStore((s) => s.completedLevels)
  const completeOnboarding = useProgressStore((s) => s.completeOnboarding)
  const navigate = useNavigate()

  const open = loaded && !onboarded

  const dismiss = (start: boolean) => {
    completeOnboarding()
    if (start) {
      const next = resumeLevel(completedLevels, null)
      navigate(`/app/level/${next?.id ?? "1.1"}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dismiss(false)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Welcome to ESPHome Learn 👋</DialogTitle>
          <DialogDescription>
            You'll learn to build real smart devices across 22 guided levels. Here's the path:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/15 to-cyan-500/15">
                <s.icon className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {i + 1}. {s.title}
                </p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => dismiss(false)}>
            Explore on my own
          </Button>
          <Button onClick={() => dismiss(true)}>Start level 1</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
