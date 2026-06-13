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
import { useTranslation } from "@/lib/i18n"
import { useProgressStore } from "@/stores/progressStore"
import { Code2, Cpu, Hammer, Lightbulb } from "lucide-react"
import { useNavigate } from "react-router-dom"

const STEPS = [
  { icon: Lightbulb, titleKey: "onboarding.s1Title" as const, descKey: "onboarding.s1Desc" as const },
  { icon: Code2, titleKey: "onboarding.s2Title" as const, descKey: "onboarding.s2Desc" as const },
  { icon: Hammer, titleKey: "onboarding.s3Title" as const, descKey: "onboarding.s3Desc" as const },
  { icon: Cpu, titleKey: "onboarding.s4Title" as const, descKey: "onboarding.s4Desc" as const },
]

export function OnboardingDialog() {
  const loaded = useProgressStore((s) => s.loaded)
  const onboarded = useProgressStore((s) => s.onboarded)
  const completedLevels = useProgressStore((s) => s.completedLevels)
  const completeOnboarding = useProgressStore((s) => s.completeOnboarding)
  const navigate = useNavigate()
  const { t } = useTranslation()

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
          <DialogTitle className="text-xl">{t("onboarding.title")}</DialogTitle>
          <DialogDescription>{t("onboarding.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {STEPS.map((s, i) => (
            <div key={s.titleKey} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/15 to-cyan-500/15">
                <s.icon className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {i + 1}. {t(s.titleKey)}
                </p>
                <p className="text-xs text-muted-foreground">{t(s.descKey)}</p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => dismiss(false)}>
            {t("onboarding.explore")}
          </Button>
          <Button onClick={() => dismiss(true)}>{t("onboarding.start")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
