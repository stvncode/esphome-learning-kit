import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  XCircle,
  Cpu,
  Sparkles,
  Activity,
  Radio,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLevelT } from "@/lib/i18n"
import { useRecordQuizScore } from "@/lib/useQuizScore"
import { useProgressStore } from "@/stores/progressStore"

const i2cYaml = `i2c:
  sda: GPIO21
  scl: GPIO22
  scan: true

sensor:
  - platform: bme280_i2c
    temperature:
      name: "Room Temperature"
    pressure:
      name: "Barometric Pressure"
    humidity:
      name: "Relative Humidity"
    address: 0x76
    update_interval: 30s`

const spiYaml = `spi:
  clk_pin: GPIO18
  mosi_pin: GPIO23
  miso_pin: GPIO19

display:
  - platform: ili9xxx
    model: ILI9341
    cs_pin: GPIO5
    dc_pin: GPIO2
    reset_pin: GPIO4
    lambda: |-
      it.print(0, 0, id(font1), "Hello World");`

interface Question {
  id: string
  question: string
  answers: { id: string; text: string }[]
  correctId: string
  explanation: string
}

const questions: Question[] = [
  {
    id: "q1",
    question: "quiz.q1.question",
    answers: [
      { id: "a", text: "TX and RX" },
      { id: "b", text: "MOSI and MISO" },
      { id: "c", text: "SDA and SCL" },
      { id: "d", text: "CLK and DATA" },
    ],
    correctId: "c",
    explanation: "quiz.q1.explanation",
  },
  {
    id: "q2",
    question: "quiz.q2.question",
    answers: [
      { id: "a", text: "platform: gpio" },
      { id: "b", text: "platform: bme280_i2c" },
      { id: "c", text: "platform: i2c_sensor" },
      { id: "d", text: "platform: custom" },
    ],
    correctId: "b",
    explanation: "quiz.q2.explanation",
  },
  {
    id: "q3",
    question: "quiz.q3.question",
    answers: [
      { id: "a", text: "quiz.q3.answers.a" },
      { id: "b", text: "quiz.q3.answers.b" },
      { id: "c", text: "quiz.q3.answers.c" },
      { id: "d", text: "quiz.q3.answers.d" },
    ],
    correctId: "b",
    explanation: "quiz.q3.explanation",
  },
]

const busCards = [
  {
    id: "i2c",
    label: "I2C",
    subtitle: "buses.i2c.subtitle",
    icon: Radio,
    color: "text-pink-400",
    bg: "bg-pink-500/20",
    border: "border-pink-500/30",
    pins: [
      { name: "SDA", desc: "buses.i2c.pins.sda", pin: "GPIO21" },
      { name: "SCL", desc: "buses.i2c.pins.scl", pin: "GPIO22" },
    ],
    pros: ["buses.i2c.pros.0", "buses.i2c.pros.1", "buses.i2c.pros.2"],
    cons: ["buses.i2c.cons.0", "buses.i2c.cons.1"],
    example: "buses.i2c.example",
  },
  {
    id: "spi",
    label: "SPI",
    subtitle: "buses.spi.subtitle",
    icon: Activity,
    color: "text-violet-400",
    bg: "bg-violet-500/20",
    border: "border-violet-500/30",
    pins: [
      { name: "CLK", desc: "buses.spi.pins.clk", pin: "GPIO18" },
      { name: "MOSI", desc: "buses.spi.pins.mosi", pin: "GPIO23" },
      { name: "MISO", desc: "buses.spi.pins.miso", pin: "GPIO19" },
      { name: "CS", desc: "buses.spi.pins.cs", pin: "GPIO5" },
    ],
    pros: ["buses.spi.pros.0", "buses.spi.pros.1", "buses.spi.pros.2"],
    cons: ["buses.spi.cons.0", "buses.spi.cons.1"],
    example: "buses.spi.example",
  },
]

export function Level6_3() {
  const t = useLevelT("6_3")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})

  const { completeLevel, completedLevels } = useProgressStore()
  const recordQuizScore = useRecordQuizScore()
  const isCompleted = completedLevels.includes("6.3")

  const handleAnswer = (questionId: string, answerId: string) => {
    if (submitted[questionId]) return
    const newAnswers = { ...answers, [questionId]: answerId }
    const newSubmitted = { ...submitted, [questionId]: true }
    setAnswers(newAnswers)
    setSubmitted(newSubmitted)
    if (Object.keys(newSubmitted).length === questions.length) {
      const correct = questions.filter((q) => newAnswers[q.id] === q.correctId).length
      recordQuizScore("6.3", correct, questions.length)
      if (correct === questions.length) {
        completeLevel("6.3")
      }
    }
  }

  const allAnswered = Object.keys(submitted).length === questions.length
  const allCorrect = questions.every((q) => answers[q.id] === q.correctId)

  const reset = () => {
    setAnswers({})
    setSubmitted({})
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
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
        <p className="text-lg text-muted-foreground">{t("header.subtitle")}</p>
      </div>

      {/* Bus comparison */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        {busCards.map((bus) => {
          const Icon = bus.icon
          return (
            <motion.div
              key={bus.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: bus.id === "spi" ? 0.1 : 0 }}
            >
              <Card className={cn("h-full border-border/50 bg-card/50", `border ${bus.border}`)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", bus.bg)}>
                      <Icon className={cn("h-5 w-5", bus.color)} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{bus.label}</CardTitle>
                      <CardDescription className="text-xs">
                        {t(bus.subtitle as Parameters<typeof t>[0])}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pins */}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("buses.pinsLabel")}
                    </p>
                    <div className="space-y-1">
                      {bus.pins.map((pin) => (
                        <div key={pin.name} className="flex items-center gap-2 text-xs">
                          <code className={cn("w-12 rounded px-1 font-mono font-bold", bus.bg, bus.color)}>
                            {pin.name}
                          </code>
                          <span className="text-muted-foreground">
                            {t(pin.desc as Parameters<typeof t>[0])}
                          </span>
                          <span className="ml-auto font-mono text-muted-foreground/60">{pin.pin}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Pros/cons */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="mb-1 font-medium text-green-400">{t("buses.prosLabel")}</p>
                      {bus.pros.map((p) => (
                        <p key={p} className="text-muted-foreground">
                          • {t(p as Parameters<typeof t>[0])}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-amber-400">{t("buses.consLabel")}</p>
                      {bus.cons.map((c) => (
                        <p key={c} className="text-muted-foreground">
                          • {t(c as Parameters<typeof t>[0])}
                        </p>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/60">{t("buses.commonDevices")} </span>
                    {t(bus.example as Parameters<typeof t>[0])}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Config examples */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("configs.i2c.title")}</CardTitle>
            <CardDescription className="text-xs">{t("configs.i2c.desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/50 bg-gray-950 p-3">
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-green-400">
                {i2cYaml}
              </pre>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("configs.spi.title")}</CardTitle>
            <CardDescription className="text-xs">{t("configs.spi.desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/50 bg-gray-950 p-3">
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-green-400">
                {spiYaml}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Cpu className="h-5 w-5 text-pink-400" />
          <h2 className="text-lg font-semibold">{t("quiz.heading")}</h2>
        </div>

        {questions.map((q, qi) => {
          const userAnswer = answers[q.id]
          const isSubmitted = submitted[q.id]
          return (
            <Card
              key={q.id}
              className={cn(
                "border-border/50 bg-card/50",
                isSubmitted && userAnswer === q.correctId && "border-green-500/30",
                isSubmitted && userAnswer !== q.correctId && "border-red-500/30",
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isSubmitted && userAnswer === q.correctId
                        ? "bg-green-500/20 text-green-400"
                        : isSubmitted
                          ? "bg-red-500/20 text-red-400"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {qi + 1}
                  </div>
                  <CardTitle className="text-sm leading-relaxed">
                    {t(q.question as Parameters<typeof t>[0])}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {q.answers.map((answer) => {
                    const isSelected = userAnswer === answer.id
                    const isCorrect = answer.id === q.correctId
                    const showCorrect = isSubmitted && isCorrect
                    const showWrong = isSubmitted && isSelected && !isCorrect
                    return (
                      <motion.button
                        key={answer.id}
                        onClick={() => handleAnswer(q.id, answer.id)}
                        disabled={isSubmitted}
                        whileHover={!isSubmitted ? { scale: 1.01 } : {}}
                        whileTap={!isSubmitted ? { scale: 0.99 } : {}}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left text-sm transition-all",
                          showCorrect
                            ? "border-green-500 bg-green-500/10 text-green-400"
                            : showWrong
                              ? "border-red-500 bg-red-500/10 text-red-400"
                              : isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border/50 hover:border-border hover:bg-muted/50",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                            showCorrect ? "bg-green-500/20" : showWrong ? "bg-red-500/20" : "bg-muted",
                          )}
                        >
                          {showCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : showWrong ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            answer.id.toUpperCase()
                          )}
                        </div>
                        {t(answer.text as Parameters<typeof t>[0])}
                      </motion.button>
                    )
                  })}
                </div>
                <AnimatePresence>
                  {isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 overflow-hidden"
                    >
                      <div
                        className={cn(
                          "rounded-lg p-3 text-xs",
                          userAnswer === q.correctId
                            ? "border border-green-500/30 bg-green-500/5 text-green-300"
                            : "border border-red-500/30 bg-red-500/5 text-red-300",
                        )}
                      >
                        <span className="font-medium">
                          {userAnswer === q.correctId ? t("quiz.correct") : t("quiz.notQuite")}
                        </span>
                        {t(q.explanation as Parameters<typeof t>[0])}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          )
        })}

        {/* Outcome */}
        <AnimatePresence>
          {allAnswered && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {allCorrect ? (
                <Card className="border-2 border-pink-500/50 bg-gradient-to-br from-pink-500/10 to-violet-500/10">
                  <CardContent className="py-10 text-center">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink-500/20"
                    >
                      <Sparkles className="h-10 w-10 text-pink-400" />
                    </motion.div>
                    <h3 className="mb-2 text-2xl font-bold">{t("outcome.title")}</h3>
                    <p className="mb-2 text-muted-foreground">{t("outcome.mastered")}</p>
                    <div className="my-6 flex flex-wrap justify-center gap-2">
                      {[
                        "outcome.topics.lambdas",
                        "outcome.topics.customComponents",
                        "outcome.topics.i2c",
                        "outcome.topics.spi",
                      ].map((item) => (
                        <Badge key={item} className="bg-pink-500/20 text-pink-300">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          {t(item as Parameters<typeof t>[0])}
                        </Badge>
                      ))}
                    </div>
                    <p className="mb-6 text-sm text-muted-foreground">{t("outcome.toolkit")}</p>
                    <div className="flex justify-center">
                      <Badge className="bg-gradient-to-r from-pink-500/20 to-violet-500/20 px-4 py-2 text-base text-pink-300">
                        🎓 {t("outcome.graduate")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="py-6 text-center">
                    <p className="mb-4 text-sm text-muted-foreground">{t("outcome.reviewHint")}</p>
                    <Button variant="outline" onClick={reset}>
                      {t("buttons.tryAgain")}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
