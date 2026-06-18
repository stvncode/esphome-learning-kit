import { CtaFooter } from "@/components/landing/CtaFooter"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { useLandingT } from "@/lib/i18n"
import { motion } from "framer-motion"
import { Boxes, GraduationCap, Languages, Layers, Sparkles, Trophy, Wrench } from "lucide-react"

const FEATURES = [
  {
    icon: Layers,
    titleKey: "why.levelsTitle" as const,
    descKey: "why.levelsDesc" as const,
    iconColor: "text-blue-500",
    border: "border-blue-500/20",
    gradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    icon: Wrench,
    titleKey: "why.builderTitle" as const,
    descKey: "why.builderDesc" as const,
    iconColor: "text-indigo-500",
    border: "border-indigo-500/20",
    gradient: "from-indigo-500/10 to-purple-500/10",
  },
  {
    icon: Boxes,
    titleKey: "why.glossaryTitle" as const,
    descKey: "why.glossaryDesc" as const,
    iconColor: "text-green-500",
    border: "border-green-500/20",
    gradient: "from-green-500/10 to-emerald-500/10",
  },
  {
    icon: Trophy,
    titleKey: "why.trackingTitle" as const,
    descKey: "why.trackingDesc" as const,
    iconColor: "text-amber-500",
    border: "border-amber-500/20",
    gradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    icon: GraduationCap,
    titleKey: "why.teacherTitle" as const,
    descKey: "why.teacherDesc" as const,
    iconColor: "text-cyan-500",
    border: "border-cyan-500/20",
    gradient: "from-cyan-500/10 to-blue-500/10",
  },
  {
    icon: Languages,
    titleKey: "why.languagesTitle" as const,
    descKey: "why.languagesDesc" as const,
    iconColor: "text-rose-500",
    border: "border-rose-500/20",
    gradient: "from-rose-500/10 to-pink-500/10",
  },
]

export function Why() {
  const t = useLandingT()
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      {/* Intro */}
      <section className="relative overflow-hidden pt-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.488_0.243_264.376_/_0.12),transparent)]" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.04]">
            <defs>
              <pattern
                id="dots-why"
                x="0"
                y="0"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-why)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-2xl px-6 py-20 text-center md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {t("why.badge")}
            </div>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              {t("why.titleStart")}{" "}
              <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 bg-clip-text text-transparent">
                {t("why.titleAccent")}
              </span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">{t("why.intro")}</p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/20 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 text-center text-3xl font-bold"
          >
            {t("why.featuresTitle")}
          </motion.h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              >
                <div
                  className={`h-full space-y-4 rounded-2xl border ${f.border} bg-gradient-to-br ${f.gradient} p-6`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/60">
                    <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold">{t(f.titleKey)}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(f.descKey)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CtaFooter />
    </div>
  )
}
