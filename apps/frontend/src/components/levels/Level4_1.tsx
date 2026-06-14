import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2,
  ChevronRight,
  Code2,
  Pencil,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLevelT } from "@/lib/i18n"
import { useProgressStore } from "@/stores/progressStore"
import { Link } from "react-router-dom"

interface Blank {
  id: string
  label: string
  answer: string
  placeholder: string
  hint: string
}

const blanks: Blank[] = [
  {
    id: "device_name",
    label: "blanks.deviceName.label",
    answer: "my-esp-device",
    placeholder: "blanks.deviceName.placeholder",
    hint: "blanks.deviceName.hint",
  },
  {
    id: "button_pin",
    label: "blanks.buttonPin.label",
    answer: "GPIO4",
    placeholder: "blanks.buttonPin.placeholder",
    hint: "blanks.buttonPin.hint",
  },
  {
    id: "light_pin",
    label: "blanks.lightPin.label",
    answer: "GPIO5",
    placeholder: "blanks.lightPin.placeholder",
    hint: "blanks.lightPin.hint",
  },
  {
    id: "trigger",
    label: "blanks.trigger.label",
    answer: "on_press",
    placeholder: "blanks.trigger.placeholder",
    hint: "blanks.trigger.hint",
  },
  {
    id: "action",
    label: "blanks.action.label",
    answer: "light.turn_on",
    placeholder: "blanks.action.placeholder",
    hint: "blanks.action.hint",
  },
]

const getLineColor = (line: string) => {
  if (line.includes("esphome:")) return "text-blue-400"
  if (line.includes("name:")) return "text-purple-400"
  if (line.includes("esp32:") || line.includes("board:")) return "text-cyan-400"
  if (line.includes("wifi:") || line.includes("ssid:") || line.includes("password:")) return "text-cyan-400"
  if (line.includes("binary_sensor:")) return "text-blue-400"
  if (line.includes("platform:")) return "text-cyan-400"
  if (line.includes("pin:")) return "text-green-400"
  if (line.includes("on_press:") || line.includes("on_release:")) return "text-orange-400"
  if (line.includes("then:")) return "text-orange-400"
  if (line.includes("light.turn_") || line.includes("light.toggle")) return "text-red-400"
  if (line.includes("light:")) return "text-amber-400"
  if (line.includes("output:")) return "text-green-400"
  if (line.includes("id:")) return "text-pink-400"
  return "text-foreground"
}

export function Level4_1() {
  const [values, setValues] = useState<Record<string, string>>({
    device_name: "",
    button_pin: "",
    light_pin: "",
    trigger: "",
    action: "",
  })
  const [challengeComplete, setChallengeComplete] = useState(false)
  const t = useLevelT("4_1")

  const { completeLevel, completedLevels } = useProgressStore()
  const isCompleted = completedLevels.includes("4.1")

  const getStatus = (blankId: string): "empty" | "wrong" | "correct" => {
    const blank = blanks.find((b) => b.id === blankId)
    if (!blank) return "empty"
    const val = values[blankId]?.trim()
    if (!val) return "empty"
    return val === blank.answer ? "correct" : "wrong"
  }

  const allCorrect = blanks.every((b) => getStatus(b.id) === "correct")

  useEffect(() => {
    if (allCorrect && !challengeComplete) {
      setChallengeComplete(true)
      completeLevel("4.1")
    }
  }, [allCorrect, challengeComplete, completeLevel])

  const deviceName = values.device_name.trim() || "___"
  const buttonPin = values.button_pin.trim() || "___"
  const lightPin = values.light_pin.trim() || "___"
  const trigger = values.trigger.trim() || "___"
  const action = values.action.trim() || "___"

  const yamlLines = [
    "esphome:",
    `  name: ${deviceName}`,
    "",
    "esp32:",
    "  board: esp32dev",
    "",
    "wifi:",
    '  ssid: "MyNetwork"',
    '  password: "secret"',
    "",
    "binary_sensor:",
    "  - platform: gpio",
    `    pin: ${buttonPin}`,
    '    name: "My Button"',
    `    ${trigger}:`,
    "      then:",
    `        - ${action}: my_light`,
    "",
    "light:",
    "  - platform: binary",
    '    name: "My Light"',
    "    id: my_light",
    "    output: light_output",
    "",
    "output:",
    "  - platform: gpio",
    `    pin: ${lightPin}`,
    "    id: light_output",
  ]

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

      {/* Task card */}
      <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="font-medium">{t("task.title")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("task.body")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fill-in form */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-purple-400" />
              <CardTitle className="text-lg">{t("form.title")}</CardTitle>
            </div>
            <CardDescription>{t("form.desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {blanks.map((blank) => {
              const status = getStatus(blank.id)
              return (
                <div key={blank.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t(blank.label as Parameters<typeof t>[0])}</label>
                    {status === "correct" && (
                      <Badge className="bg-green-500/20 text-green-400">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> {t("status.correct")}
                      </Badge>
                    )}
                    {status === "wrong" && (
                      <Badge className="bg-red-500/20 text-red-400">{t("status.wrong")}</Badge>
                    )}
                  </div>
                  <Input
                    value={values[blank.id]}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [blank.id]: e.target.value }))
                    }
                    placeholder={t(blank.placeholder as Parameters<typeof t>[0])}
                    className={cn(
                      "font-mono",
                      status === "correct" && "border-green-500/50 focus-visible:ring-green-500",
                      status === "wrong" && "border-red-500/50 focus-visible:ring-red-500"
                    )}
                  />
                  <p className="text-xs text-muted-foreground">{t(blank.hint as Parameters<typeof t>[0])}</p>
                </div>
              )
            })}

            {/* Progress */}
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium">{t("progress.label")}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {t("progress.score", {
                    n: blanks.filter((b) => getStatus(b.id) === "correct").length,
                    total: blanks.length,
                  })}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-border/50">
                <motion.div
                  className="h-full rounded-full bg-purple-500"
                  animate={{
                    width: `${(blanks.filter((b) => getStatus(b.id) === "correct").length / blanks.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <AnimatePresence>
              {challengeComplete && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Button asChild className="w-full">
                    <Link to="/app/level/4.2">
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
            <CardDescription>{t("preview.desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/50 bg-gray-100 dark:bg-gray-950 p-4 overflow-auto max-h-[520px]">
              <pre className="font-mono text-sm">
                {yamlLines.map((line, index) => (
                  <div key={index} className="px-2 -mx-2 rounded leading-6">
                    <span className="mr-4 inline-block w-6 text-right text-muted-foreground/50">
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        getLineColor(line),
                        line.includes("___") && "bg-amber-500/20 text-amber-300"
                      )}
                    >
                      {line || "\u00A0"}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
