import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  ChevronRight,
  Code2,
  FileCode,
  Puzzle,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLevelT } from "@/lib/i18n"
import { useProgressStore } from "@/stores/progressStore"
import { Link } from "react-router-dom"

const INITIAL_VALUE = `esphome:
  name: my-device
  `

const REFERENCE_CODE = `// my_sensor.h
#pragma once
#include "esphome.h"

class MySensor : public PollingComponent, public Sensor {
 public:
  MySensor() : PollingComponent(15000) {}

  void setup() override {
    // Initialize hardware here
  }

  void update() override {
    publish_state(42.0f); // your reading
  }
};`

interface Requirement {
  id: string
  label: string
  check: (text: string) => boolean
}

const requirements: Requirement[] = [
  {
    id: "esphome",
    label: "requirements.esphome",
    check: (t) => /esphome\s*:/.test(t) && /includes\s*:/.test(t),
  },
  {
    id: "header",
    label: "requirements.header",
    check: (t) => /includes\s*:\s*\n\s*-\s*\S+\.h/.test(t),
  },
  {
    id: "custom",
    label: "requirements.custom",
    check: (t) => /custom_component\s*:/.test(t),
  },
  {
    id: "lambda",
    label: "requirements.lambda",
    check: (t) => /lambda\s*:/.test(t) && /make_shared/.test(t),
  },
  {
    id: "sensor_id",
    label: "requirements.sensor_id",
    check: (t) => /custom_component[\s\S]*?id\s*:/.test(t),
  },
]

export function Level6_2() {
  const t = useLevelT("6_2")
  const [code, setCode] = useState(INITIAL_VALUE)
  const [levelComplete, setLevelComplete] = useState(false)

  const { completeLevel, completedLevels } = useProgressStore()
  const isCompleted = completedLevels.includes("6.2")

  const checks = requirements.map((r) => ({ ...r, passed: r.check(code) }))
  const allPassed = checks.every((c) => c.passed)
  const passedCount = checks.filter((c) => c.passed).length

  useEffect(() => {
    if (allPassed && !levelComplete) {
      setLevelComplete(true)
      completeLevel("6.2")
    }
  }, [allPassed, levelComplete, completeLevel])

  return (
    <div className="mx-auto max-w-5xl p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Badge className="bg-pink-500/20 text-pink-400">{t("header.phase")}</Badge>
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

      {/* Intro card */}
      <Card className="mb-6 border-pink-500/30 bg-pink-500/5">
        <CardContent className="flex items-start gap-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-500/20">
            <Puzzle className="h-5 w-5 text-pink-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">{t("info.title")}</p>
            <p className="text-sm text-muted-foreground">
              {t("info.desc", {
                hFile: ".h",
                includes: "includes:",
                customComponent: "custom_component:",
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Editor + reference */}
        <div className="space-y-4 lg:col-span-2">
          {/* Reference: the .h file */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-pink-400" />
                <CardTitle className="text-sm">{t("reference.title")}</CardTitle>
              </div>
              <CardDescription className="text-xs">
                {t("reference.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/50 bg-gray-950 p-3">
                <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-green-400">
                  {REFERENCE_CODE}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* YAML editor */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-pink-400" />
                <CardTitle className="text-lg">{t("editor.title")}</CardTitle>
              </div>
              <CardDescription>
                {t("editor.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={cn(
                  "w-full resize-none rounded-lg border bg-gray-100 p-4 font-mono text-sm outline-none transition-colors focus:ring-2 dark:bg-gray-950",
                  allPassed
                    ? "border-green-500/50 focus:ring-green-500/30"
                    : "border-border/50 focus:ring-ring",
                )}
                rows={22}
                spellCheck={false}
                placeholder={t("editor.placeholder")}
              />
            </CardContent>
          </Card>
        </div>

        {/* Checklist sidebar */}
        <div>
          <Card className="sticky top-4 border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-400" />
                <CardTitle className="text-sm">{t("checklist.title")}</CardTitle>
              </div>
              <CardDescription className="text-xs">{t("checklist.desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {checks.map((check) => (
                <motion.div
                  key={check.id}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-2.5 transition-colors",
                    check.passed
                      ? "border-green-500/20 bg-green-500/5"
                      : "border-transparent bg-muted/20",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors",
                      check.passed ? "bg-green-500/20" : "bg-muted",
                    )}
                  >
                    {check.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "font-mono text-xs font-medium",
                      check.passed ? "text-green-400" : "text-muted-foreground",
                    )}
                  >
                    {t(check.label as Parameters<typeof t>[0])}
                  </span>
                </motion.div>
              ))}

              <div className="mt-2 rounded-lg border border-border/50 bg-muted/20 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("checklist.progress")}</span>
                  <span className="font-medium">
                    {t("checklist.count", { n: passedCount, total: requirements.length })}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-border/50">
                  <motion.div
                    className="h-full rounded-full bg-pink-500"
                    animate={{ width: `${(passedCount / requirements.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Hint */}
              <div className="rounded-lg border border-border/50 bg-muted/10 p-3 text-xs text-muted-foreground">
                <p className="mb-1 font-medium text-foreground/60">{t("hint.title")}</p>
                <p>
                  {t("hint.body", {
                    customComponent: "custom_component:",
                    lambda: "lambda: return {make_shared<MySensor>()};",
                  })}
                </p>
              </div>

              <AnimatePresence>
                {levelComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-center">
                      <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-500" />
                      <p className="text-sm font-semibold text-green-400">{t("complete.title")}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("complete.desc")}
                      </p>
                    </div>
                    <Button asChild className="w-full">
                      <Link to="/app/level/6.3">
                        {t("complete.continue")}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
