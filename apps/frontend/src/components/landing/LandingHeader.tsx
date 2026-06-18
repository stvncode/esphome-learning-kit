import { Button } from "@/components/ui/button"
import { useLandingT } from "@/lib/i18n"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const NAV = [
  { key: "header.features" as const, href: "#features" },
  { key: "header.builder" as const, href: "#builder" },
  { key: "header.curriculum" as const, href: "#curriculum" },
]

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const t = useLandingT()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "border-b border-border bg-background/90 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div onClick={() => navigate("/")} className="flex items-center gap-2.5 cursor-pointer">
          <img src="/esp32.png" className="h-10 w-10" />
          <span className="font-semibold text-foreground">ESPHome Learning</span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(item.key)}
            </a>
          ))}
          <Link
            to="/why"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("header.why")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link to="/signin">{t("header.signIn")}</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">{t("header.getStarted")}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
