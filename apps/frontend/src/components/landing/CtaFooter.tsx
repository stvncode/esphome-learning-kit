import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useLandingT } from "@/lib/i18n"

export function CtaFooter() {
  const t = useLandingT()
  return (
    <>
      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-foreground">{t("cta.title")}</h2>
              <p className="text-lg text-muted-foreground">{t("cta.subtitle")}</p>
            </div>
            <div className="flex justify-center">
              <Button asChild size="lg" className="h-12 gap-2 px-8">
                <Link to="/signup">
                  {t("cta.button")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2">
            <img src="/esp32.png" className="h-10 w-10" />
            <span className="text-sm font-semibold text-foreground">ESPHome Learning</span>
          </div>
          <p className="text-xs text-muted-foreground">{t("footer.tagline")}</p>
          <div className="flex gap-6">
            <Link
              to="/signin"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("footer.signIn")}
            </Link>
            <Link
              to="/signup"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("footer.signUp")}
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}
