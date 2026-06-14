import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2,
  ChevronRight,
  Code2,
  Plus,
  AlertCircle,
  Lightbulb,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLevelT } from "@/lib/i18n"
import { useProgressStore } from "@/stores/progressStore"
import { Link } from "react-router-dom"

const BASE_YAML = `esphome:
  name: my-esp-device

esp32:
  board: esp32dev

wifi:
  ssid: "MyNetwork"
  password: "secret"

binary_sensor:
  - platform: gpio
    pin: GPIO4
    name: "My Button"
    on_press:
      then:
        - light.turn_on: my_light

light:
  - platform: binary
    name: "My Light"
    id: my_light
    output: light_output_1

output:
  - platform: gpio
    pin: GPIO5
    id: light_output_1`

const getLineColor = (line: string) => {
  if (line.includes("esphome:") || line.includes("binary_sensor:")) return "text-blue-400"
  if (line.includes("name:")) return "text-purple-400"
  if (line.includes("esp32:") || line.includes("board:") || line.includes("wifi:") || line.includes("ssid:") || line.includes("password:")) return "text-cyan-400"
  if (line.includes("platform:")) return "text-cyan-400"
  if (line.includes("pin:")) return "text-green-400"
  if (line.includes("on_press:") || line.includes("then:")) return "text-orange-400"
  if (line.includes("light.turn_") || line.includes("light.toggle")) return "text-red-400"
  if (line.startsWith("light:") || (line.includes("light:") && !line.includes("light."))) return "text-amber-400"
  if (line.includes("output:")) return "text-green-400"
  if (line.includes("id:")) return "text-pink-400"
  return "text-foreground"
}

export function Level4_2() {
  const t = useLevelT("4_2")
  const [lightName, setLightName] = useState("")
  const [lightPin, setLightPin] = useState("")
  const [added, setAdded] = useState(false)
  const [attempted, setAttempted] = useState(false)

  const { completeLevel, completedLevels } = useProgressStore()
  const isCompleted = completedLevels.includes("4.2")

  const nameValid = lightName.trim().length >= 2
  const pinValid = /^GPIO\d+$/i.test(lightPin.trim())
  const canAdd = nameValid && pinValid

  const handleAdd = () => {
    setAttempted(true)
    if (!canAdd) return
    setAdded(true)
    completeLevel("4.2")
  }

  const lightId = lightName.trim()
    ? `my_light_${lightName.trim().toLowerCase().replace(/\s+/g, "_")}`
    : "my_light_2"

  const lightOutputId = lightName.trim()
    ? `light_output_${lightName.trim().toLowerCase().replace(/\s+/g, "_")}`
    : "light_output_2"

  const addedYamlLines = added
    ? [
        `  - platform: binary`,
        `    name: "${lightName.trim()}"`,
        `    id: ${lightId}`,
        `    output: ${lightOutputId}`,
        ``,
        `output:`,
        `  - platform: gpio`,
        `    pin: ${lightPin.trim().toUpperCase()}`,
        `    id: ${lightOutputId}`,
      ]
    : []

  const fullYaml = added
    ? BASE_YAML + "\n" + addedYamlLines.join("\n")
    : BASE_YAML

  return (
    <div className="mx-auto max-w-5xl p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Badge className="bg-purple-500/20 text-purple-400">{t("header.phase")}</Badge>
          <Badge variant="outline">{t("header.level")}</Badge>
          {isCompleted && (
            <Badge className="bg-green-500/20 text-green-400">
              <CheckCircle2 className="mr-1 h-3 w-3" /> {t("header.completed")}
            </Badge>
          )}
        </div>
        <h1 className="mb-2 text-3xl font-bold">{t("header.title")}</h1>
        <p className="text-lg text-muted-foreground">
          {t("header.subtitle")}
        </p>
      </div>

      {/* Info card */}
      <Card className="mb-6 border-purple-500/30 bg-purple-500/5">
        <CardContent className="flex items-start gap-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/20">
            <Lightbulb className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">{t("info.title")}</p>
            <p className="text-sm text-muted-foreground">
              {t("info.body1")}{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">id:</code> {t("info.body2")}{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">output:</code> {t("info.body3")}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form panel */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-purple-400" />
              <CardTitle className="text-lg">{t("form.title")}</CardTitle>
            </div>
            <CardDescription>
              {t("form.desc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("form.nameLabel")}</label>
              <Input
                value={lightName}
                onChange={(e) => setLightName(e.target.value)}
                placeholder={t("form.namePlaceholder")}
                disabled={added}
                className={cn(
                  "font-mono",
                  attempted && !nameValid && "border-red-500/50",
                  nameValid && "border-green-500/50"
                )}
              />
              {attempted && !nameValid && (
                <p className="flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  {t("form.nameError")}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("form.pinLabel")}</label>
              <Input
                value={lightPin}
                onChange={(e) => setLightPin(e.target.value)}
                placeholder={t("form.pinPlaceholder")}
                disabled={added}
                className={cn(
                  "font-mono",
                  attempted && !pinValid && "border-red-500/50",
                  pinValid && "border-green-500/50"
                )}
              />
              <p className="text-xs text-muted-foreground">
                {t("form.pinHelp")}
              </p>
              {attempted && !pinValid && (
                <p className="flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  {t("form.pinError")}
                </p>
              )}
            </div>

            {!added && (
              <Button
                onClick={handleAdd}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("form.addButton")}
              </Button>
            )}

            <AnimatePresence>
              {added && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-400">{t("success.title")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("success.body")}
                      </p>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link to="/app/level/4.3">
                      {t("buttons.continue")}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* YAML Preview */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">{t("preview.title")}</CardTitle>
            </div>
            <CardDescription>
              {t("preview.desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/50 bg-gray-100 dark:bg-gray-950 p-4 overflow-auto max-h-[520px]">
              <pre className="font-mono text-sm">
                {fullYaml.split("\n").map((line, index) => {
                  const baseLineCount = BASE_YAML.split("\n").length
                  const isNew = added && index >= baseLineCount
                  return (
                    <div
                      key={index}
                      className={cn(
                        "px-2 -mx-2 rounded leading-6 transition-colors",
                        isNew && "bg-purple-500/10"
                      )}
                    >
                      <span className="mr-4 inline-block w-6 text-right text-muted-foreground/50">
                        {index + 1}
                      </span>
                      <span className={getLineColor(line)}>{line || "\u00A0"}</span>
                    </div>
                  )
                })}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
