import { motion } from "framer-motion"
import { Code2, Cpu, Lightbulb } from "lucide-react"
import { useLandingT } from "@/lib/i18n"

const STEPS = [
  { n: "01", icon: Lightbulb, titleKey: "how.s1Title" as const, descKey: "how.s1Desc" as const },
  { n: "02", icon: Code2, titleKey: "how.s2Title" as const, descKey: "how.s2Desc" as const },
  { n: "03", icon: Cpu, titleKey: "how.s3Title" as const, descKey: "how.s3Desc" as const },
]

export function HowItWorksSection() {
  const t = useLandingT()
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium text-primary">{t("how.eyebrow")}</p>
          <h2 className="text-3xl font-bold text-foreground">{t("how.title")}</h2>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
          <div className="absolute inset-x-[16%] top-5 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted font-mono text-sm font-bold text-muted-foreground">
                {step.n}
              </div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{t(step.titleKey)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(step.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
