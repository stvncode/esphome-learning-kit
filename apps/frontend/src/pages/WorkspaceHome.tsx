import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BOARD_OPTIONS,
  STARTER_KIT_BOARD,
  STARTER_KIT_NODES,
} from "@/components/workspace/constants"
import type { SavedProject } from "@/components/workspace/types"
import { useWorkspaceT } from "@/components/workspace/workspace.i18n"
import { listProjects } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Bell, ChevronRight, Clock, Cpu, Droplets, FolderOpen, Plus, Radio, Sparkles, Wrench } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

type Template = "starter-kit" | "blank"

const STARTER_KIT_FEATURES = [
  { icon: Cpu, labelKey: "home.feat.devkit" as const, color: "text-blue-400" },
  { icon: Radio, labelKey: "home.feat.button" as const, color: "text-purple-400" },
  { icon: Droplets, labelKey: "home.feat.aht20" as const, color: "text-teal-400" },
  { icon: Sparkles, labelKey: "home.feat.rgb" as const, color: "text-violet-400" },
  { icon: Bell, labelKey: "home.feat.buzzer" as const, color: "text-rose-400" },
]

export function WorkspaceHome() {
  const navigate = useNavigate()
  const t = useWorkspaceT()
  const [template, setTemplate] = useState<Template>("starter-kit")
  const [projectName, setProjectName] = useState("")
  const [board, setBoard] = useState(STARTER_KIT_BOARD)

  const { data: projects } = useQuery({
    queryKey: ["projects", "workspace"],
    queryFn: () => listProjects("workspace"),
  })
  const savedProjects: SavedProject[] = (projects ?? []).map((p) => p.data as unknown as SavedProject)

  function handleCreate() {
    const name = projectName.trim() || (template === "starter-kit" ? "starter-kit" : "my-device")
    navigate("/app/workspace/builder", {
      state: {
        deviceName: name,
        board: template === "starter-kit" ? STARTER_KIT_BOARD : board,
        nodes: template === "starter-kit" ? STARTER_KIT_NODES : [],
        edges: [],
        automations: [],
      },
    })
  }

  function handleOpenProject(project: SavedProject) {
    navigate("/app/workspace/builder", {
      state: {
        deviceName: project.deviceName,
        board: project.board ?? "esp32dev",
        wifiSsid: project.wifiSsid,
        wifiPassword: project.wifiPassword,
        area: project.area,
        nodes: project.nodes,
        edges: project.edges,
        automations: project.automations,
      },
    })
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return iso
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-10">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-emerald-400" />
          <h1 className="text-2xl font-bold tracking-tight">{t("home.title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{t("home.subtitle")}</p>
      </div>

      {/* Template selection */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("home.startFrom")}
        </p>
        <div className="grid grid-cols-2 gap-4">
          {/* Starter Kit card */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setTemplate("starter-kit")
              setBoard(STARTER_KIT_BOARD)
            }}
            className="text-left"
          >
            <Card
              className={`h-full cursor-pointer transition-all ${
                template === "starter-kit"
                  ? "border-emerald-500/60 bg-emerald-500/5 ring-1 ring-emerald-500/30"
                  : "border-border/50 hover:border-border"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{t("home.starterKit")}</CardTitle>
                  {template === "starter-kit" && (
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                      {t("home.selected")}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">{t("home.starterKitDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {STARTER_KIT_FEATURES.map(({ icon: Icon, labelKey, color }) => (
                  <div key={labelKey} className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                    <span className="text-xs text-muted-foreground">{t(labelKey)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.button>

          {/* Blank Canvas card */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setTemplate("blank")}
            className="text-left"
          >
            <Card
              className={`h-full cursor-pointer transition-all ${
                template === "blank"
                  ? "border-blue-500/60 bg-blue-500/5 ring-1 ring-blue-500/30"
                  : "border-border/50 hover:border-border"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{t("home.blank")}</CardTitle>
                  {template === "blank" && (
                    <Badge variant="outline" className="border-blue-500/40 text-blue-400 text-[10px]">
                      {t("home.selected")}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">{t("home.blankDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-1">
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-4 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-muted-foreground/50" />
                </div>
                {template === "blank" && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">{t("home.board")}</p>
                    <Select value={board} onValueChange={setBoard}>
                      <SelectTrigger className="h-8 text-sm w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BOARD_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.button>
        </div>
      </div>

      {/* Project name + Create */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("home.projectName")}
        </p>
        <div className="flex gap-3">
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder={template === "starter-kit" ? "starter-kit" : "my-device"}
            className="h-9"
          />
          <Button onClick={handleCreate} className="h-9 gap-2 shrink-0">
            {t("home.openBuilder")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {template === "starter-kit" && (
          <p className="text-[11px] text-muted-foreground">{t("home.starterHint")}</p>
        )}
      </div>

      {/* Recent projects */}
      {savedProjects.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("home.recent")}
          </p>
          <div className="space-y-2">
            {[...savedProjects]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((project) => (
                <motion.button
                  key={project.name}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleOpenProject(project)}
                  className="w-full text-left"
                >
                  <Card className="cursor-pointer border-border/50 transition-all hover:border-border">
                    <CardContent className="flex items-center gap-3 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10">
                        <FolderOpen className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {BOARD_OPTIONS.find((b) => b.value === project.board)?.label ?? project.board ?? "ESP32"}
                          {" · "}
                          {t(project.nodes.length === 1 ? "home.node" : "home.nodes", { n: project.nodes.length })}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(project.createdAt)}
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </motion.button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
