import { motion } from "framer-motion"
import { Code2, Wifi, Wrench } from "lucide-react"
import { useLandingT } from "./landing.i18n"

const FEATURES = [
  {
    icon: Wrench,
    titleKey: "features.visualTitle" as const,
    descKey: "features.visualDesc" as const,
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500",
    border: "border-blue-500/20",
  },
  {
    icon: Code2,
    titleKey: "features.yamlTitle" as const,
    descKey: "features.yamlDesc" as const,
    gradient: "from-indigo-500/10 to-purple-500/10",
    iconColor: "text-indigo-500",
    border: "border-indigo-500/20",
  },
  {
    icon: Wifi,
    titleKey: "features.hwTitle" as const,
    descKey: "features.hwDesc" as const,
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-500",
    border: "border-green-500/20",
  },
]

export function FeaturesSection() {
  const t = useLandingT()
  return (
    <section id="features" className="border-t border-border bg-muted/20 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium text-primary">{t("features.eyebrow")}</p>
          <h2 className="text-3xl font-bold text-foreground">{t("features.title")}</h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className={`h-full space-y-4 rounded-2xl border ${f.border} bg-gradient-to-br ${f.gradient} p-6`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/60">
                  <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{t(f.titleKey)}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(f.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
