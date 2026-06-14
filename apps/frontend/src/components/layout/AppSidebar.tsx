import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useCurriculumLabels, useTranslation } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Code2,
  GraduationCap,
  Hammer,
  Home,
  Lightbulb,
  Pencil,
  Sparkles,
  Wifi,
  Wrench,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Fragment } from "react"
import { Link, useLocation } from "react-router-dom"

const phases = [
  {
    id: 1,
    icon: Lightbulb,
    color: "text-amber-400",
    levels: ["1.1", "1.2", "1.3", "1.4"],
  },
  {
    id: 2,
    icon: Code2,
    color: "text-blue-400",
    levels: ["2.1", "2.2", "2.3", "2.4"],
  },
  {
    id: 3,
    icon: Pencil,
    color: "text-green-400",
    levels: ["3.1", "3.2", "3.3", "3.4", "3.5"],
  },
  {
    id: 4,
    icon: Hammer,
    color: "text-purple-400",
    levels: ["4.1", "4.2", "4.3", "4.4"],
  },
  {
    id: 5,
    icon: Wifi,
    color: "text-cyan-400",
    levels: ["5.1", "5.2"],
  },
  {
    id: 6,
    icon: Sparkles,
    color: "text-pink-400",
    levels: ["6.1", "6.2", "6.3"],
  },
]

const topNav: { to: string; icon: LucideIcon; labelKey: "nav.dashboard" | "nav.workspace" | "nav.classes"; match: (p: string) => boolean }[] = [
  { to: "/app", icon: Home, labelKey: "nav.dashboard", match: (p) => p === "/app" },
  { to: "/app/workspace", icon: Wrench, labelKey: "nav.workspace", match: (p) => p.startsWith("/app/workspace") },
  { to: "/app/classes", icon: GraduationCap, labelKey: "nav.classes", match: (p) => p.startsWith("/app/classes") },
]

export function AppSidebar({ variant = "inset", ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const { levelTitle, phaseLabel } = useCurriculumLabels()
  const { setOpenMobile, isMobile } = useSidebar()

  // Close the mobile drawer after navigating.
  const close = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon" variant={variant} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="group-data-[collapsible=icon]:mx-auto hover:bg-transparent active:bg-transparent"
            >
              <Link to="/app" onClick={close}>
                <img src="/esp32.png" className="size-8 shrink-0" alt="" />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold tracking-tight">ESPHome Learning</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {t("nav.starterKitGuide")}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="group-data-[collapsible=icon]:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Primary navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {topNav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.match(pathname)}
                    tooltip={t(item.labelKey)}
                    className="group-data-[collapsible=icon]:mx-auto"
                  >
                    <Link to={item.to} onClick={close}>
                      <item.icon />
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Curriculum — phase headers + level links (numbers stay visible in the icon rail) */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {phases.map((phase) => {
                const Icon = phase.icon
                return (
                  <Fragment key={phase.id}>
                    <SidebarMenuItem>
                      <div
                        title={phaseLabel(phase.id)}
                        className={cn(
                          "flex items-center gap-2 px-2 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider",
                          phase.color,
                          "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                        )}
                      >
                        <Icon className="size-3.5 shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {phaseLabel(phase.id)}
                        </span>
                      </div>
                    </SidebarMenuItem>
                    {phase.levels.map((id) => (
                      <SidebarMenuItem key={id}>
                        <SidebarMenuButton
                          asChild
                          size="sm"
                          isActive={pathname === `/app/level/${id}`}
                          tooltip={levelTitle(id)}
                          className="group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!"
                        >
                          <Link to={`/app/level/${id}`} onClick={close}>
                            <span className="shrink-0 font-mono text-xs opacity-60">{id}</span>
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                              {levelTitle(id)}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </Fragment>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/app/glossary"}
              tooltip={t("nav.helpTitle")}
              className="group-data-[collapsible=icon]:mx-auto"
            >
              <Link to="/app/glossary" onClick={close}>
                <BookOpen />
                <span>{t("nav.glossary")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
