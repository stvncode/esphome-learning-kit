import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { ACHIEVEMENTS } from "@/lib/achievements"
import { signOut, useSession } from "@/lib/auth-client"
import { useTranslation } from "@/lib/i18n"
import { useCurriculumLabels } from "@/lib/i18n/curriculum.i18n"
import { useProgressStore } from "@/stores/progressStore"
import { useQueryClient } from "@tanstack/react-query"
import {
  ChevronRight,
  Flame,
  GraduationCap,
  Home,
  LogOut,
  Moon,
  Settings,
  Sun,
  Trophy,
  User,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"

const PHASE_META: Record<number, { color: string }> = {
  1: { color: "text-amber-400" },
  2: { color: "text-blue-400" },
  3: { color: "text-green-400" },
  4: { color: "text-purple-400" },
  5: { color: "text-cyan-400" },
  6: { color: "text-pink-400" },
}

function Breadcrumb() {
  const location = useLocation()
  const params = useParams<{ levelId?: string }>()
  const { t } = useTranslation()
  const { levelTitle, phaseLabel } = useCurriculumLabels()
  const path = location.pathname

  type Crumb = { label: string; to?: string; color?: string }
  const crumbs: Crumb[] = [{ label: t("nav.dashboard"), to: "/app" }]

  if (path === "/app/workspace") {
    crumbs.push({ label: t("nav.workspace") })
  } else if (path.startsWith("/app/workspace/builder")) {
    crumbs.push({ label: t("nav.workspace"), to: "/app/workspace" })
    crumbs.push({ label: t("nav.builder") })
  } else if (path === "/app/classes") {
    crumbs.push({ label: t("nav.classes") })
  } else if (path === "/app/glossary") {
    crumbs.push({ label: t("nav.glossary") })
  } else if (path === "/app/settings") {
    crumbs.push({ label: t("nav.settings") })
  } else if (params.levelId) {
    const phaseNum = parseInt(params.levelId.split(".")[0])
    const phase = PHASE_META[phaseNum]
    crumbs.push({ label: phaseLabel(phaseNum), color: phase?.color })
    crumbs.push({ label: levelTitle(params.levelId) })
  }

  if (crumbs.length <= 1) return null

  return (
    <nav className="flex items-center gap-1 text-sm">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        const isFirst = i === 0
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />}
            {crumb.to ? (
              <Link
                to={crumb.to}
                className={
                  isFirst
                    ? "text-muted-foreground hover:text-foreground transition-colors"
                    : `font-medium transition-colors hover:text-foreground ${crumb.color ?? "text-muted-foreground"}`
                }
              >
                {isFirst ? <Home className="h-3.5 w-3.5" /> : crumb.label}
              </Link>
            ) : (
              <span
                className={`font-medium ${isLast ? "text-foreground" : (crumb.color ?? "text-muted-foreground")}`}
              >
                {crumb.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export function Header() {
  const { completedLevels, streak, achievements } = useProgressStore()
  const clearProgress = useProgressStore((s) => s.clear)
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const totalLevels = 22
  const progressPercent = (completedLevels.length / totalLevels) * 100
  const unlockedIds = new Set(achievements.map((a) => a.id))

  const handleSignOut = async () => {
    await signOut()
    clearProgress()
    queryClient.clear()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-sm">
      <div>
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t("header.yourProgress")}</span>
            <Badge variant="secondary" className="text-xs">
              {t("header.levels", { done: completedLevels.length, total: totalLevels })}
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2 w-36" />
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-1.5">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-semibold text-orange-500">{streak}</span>
          <span className="text-xs text-muted-foreground">{t("header.dayStreak")}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-1.5 transition-colors hover:bg-amber-500/20">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-500">{achievements.length}</span>
              <span className="text-xs text-muted-foreground">{t("header.achievements")}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>
              Achievements
              <span className="ml-1 font-normal text-muted-foreground">
                {achievements.length}/{ACHIEVEMENTS.length}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {ACHIEVEMENTS.map((def) => {
                const unlocked = unlockedIds.has(def.id)
                return (
                  <div
                    key={def.id}
                    className={`flex items-start gap-3 px-2 py-1.5 ${unlocked ? "" : "opacity-40"}`}
                  >
                    <span className="text-lg leading-none">{unlocked ? def.icon : "🔒"}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">{def.title}</p>
                      <p className="text-xs text-muted-foreground">{def.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {unlockedIds.has("graduate") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/certificate" className="cursor-pointer">
                    <GraduationCap className="h-4 w-4" />
                    {t("account.viewCertificate")}
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-semibold text-white">
                {session?.user?.name?.[0]?.toUpperCase() ?? <User className="h-4 w-4" />}
              </span>
              <span className="sr-only">Account menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex flex-col">
              <span className="truncate">{session?.user?.name ?? "Account"}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {session?.user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/app/settings" className="cursor-pointer">
                <Settings className="h-4 w-4" />
                {t("account.settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleSignOut} className="text-red-400 focus:text-red-400">
              <LogOut className="h-4 w-4" />
              {t("account.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
