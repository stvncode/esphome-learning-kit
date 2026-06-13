import { CountUp } from "@/components/CountUp"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { resumeLevel } from "@/lib/curriculum"
import { useCurriculumLabels } from "@/lib/i18n/curriculum.i18n"
import { useProgressStore } from "@/stores/progressStore"
import { motion } from "framer-motion"
import { GraduationCap, Play, Wrench } from "lucide-react"
import { Link } from "react-router-dom"
import { HomeFlowDemo } from "./HomeFlowDemo"
import { useHomeT } from "./home.i18n"

export function HomeHero() {
  const { completedLevels, currentLevel } = useProgressStore()
  const resume = resumeLevel(completedLevels, currentLevel)
  const started = completedLevels.length > 0
  const t = useHomeT()
  const { levelTitle } = useCurriculumLabels()

  return (
    <section className="grid grid-cols-1 gap-8 items-center lg:grid-cols-2 lg:gap-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="space-y-1">
          <Badge className="mb-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30">
            {t("hero.badge")}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            {t("hero.title1")}
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t("hero.title2")}
            </span>
          </h1>
        </div>
        <p className="text-muted-foreground leading-relaxed max-w-md">
          {t("hero.subtitle")}
        </p>
        <div className="space-y-2">
          <div className="flex gap-3">
            {resume ? (
              <Button asChild size="lg" className="gap-2">
                <Link to={`/app/level/${resume.id}`}>
                  <Play className="h-4 w-4" />
                  {started ? t("hero.continue") : t("hero.start")}
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="gap-2">
                <Link to="/app/certificate">
                  <GraduationCap className="h-4 w-4" />
                  {t("hero.certificate")}
                </Link>
              </Button>
            )}
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/app/workspace">
                <Wrench className="h-4 w-4" />
                {t("hero.workspace")}
              </Link>
            </Button>
          </div>
          {resume && started && (
            <p className="text-xs text-muted-foreground">
              {t("hero.upNext", { id: resume.id, title: levelTitle(resume.id) })}
            </p>
          )}
        </div>

        <div className="flex gap-6 pt-2">
          {[
            { label: t("hero.statPhases"), value: 6, suffix: "" },
            { label: t("hero.statLevels"), value: 22, suffix: "" },
            { label: t("hero.statProgress"), value: Math.round((completedLevels.length / 22) * 100), suffix: "%" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold">
                <CountUp value={s.value} suffix={s.suffix} />
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          {t("hero.livePreview")}
        </div>
        <div className="overflow-x-auto">
          <HomeFlowDemo />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {t("hero.previewCaption")}
        </p>
      </motion.div>
    </section>
  )
}
