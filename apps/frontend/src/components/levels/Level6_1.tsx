import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  XCircle,
  Code2,
  Cpu,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLevelT } from "@/lib/i18n"
import { useRecordQuizScore } from "@/lib/useQuizScore"
import { useProgressStore } from "@/stores/progressStore"
import { Link } from "react-router-dom"

interface Step {
  id: string
  number: number
  title: string
  explanation: string
  code?: string
}

const steps: Step[] = [
  {
    id: "what",
    number: 1,
    title: "steps.what.title",
    explanation: "steps.what.explanation",
    code: `# Minimal lambda example
sensor:
  - platform: template
    name: "Adjusted Temp"
    lambda: 'return id(raw_temp).state - 2.5;'
    update_interval: 5s`,
  },
  {
    id: "syntax",
    number: 2,
    title: "steps.syntax.title",
    explanation: "steps.syntax.explanation",
    code: `binary_sensor:
  - platform: gpio
    pin: GPIO4
    on_press:
      then:
        lambda: |-
          if (id(my_light).current_values.is_on()) {
            id(my_light).turn_off();
          } else {
            id(my_light).turn_on();
          }`,
  },
  {
    id: "id",
    number: 3,
    title: "steps.id.title",
    explanation: "steps.id.explanation",
    code: `light:
  - platform: binary
    name: "My Light"
    id: my_light      # <-- referenced as id(my_light)
    output: out_pin

sensor:
  - platform: dht
    temperature:
      name: "Temperature"
      id: temp_sensor   # <-- read as id(temp_sensor).state`,
  },
  {
    id: "example",
    number: 4,
    title: "steps.example.title",
    explanation: "steps.example.explanation",
    code: `sensor:
  - platform: dht
    temperature:
      name: "Room Temp"
      id: room_temp
      on_value:
        then:
          lambda: |-
            if (x > 30.0f) {
              id(cooling_fan).turn_on();
            } else {
              id(cooling_fan).turn_off();
            }`,
  },
]

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
    question: "questions.q1.question",
    answers: [
      { id: "a", text: "questions.q1.answers.a" },
      { id: "b", text: "questions.q1.answers.b" },
      { id: "c", text: "questions.q1.answers.c" },
      { id: "d", text: "questions.q1.answers.d" },
    ],
    correctId: "b",
    explanation: "questions.q1.explanation",
  },
  {
    id: "q2",
    question: "questions.q2.question",
    answers: [
      { id: "a", text: "questions.q2.answers.a" },
      { id: "b", text: "questions.q2.answers.b" },
      { id: "c", text: "questions.q2.answers.c" },
      { id: "d", text: "questions.q2.answers.d" },
    ],
    correctId: "c",
    explanation: "questions.q2.explanation",
  },
]

export function Level6_1() {
  const t = useLevelT("6_1")
  const [openSteps, setOpenSteps] = useState<Set<string>>(new Set())
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})

  const { completeLevel, completedLevels } = useProgressStore()
  const recordQuizScore = useRecordQuizScore()
  const isCompleted = completedLevels.includes("6.1")
  const allStepsRead = openSteps.size === steps.length

  const toggleStep = (id: string) => {
    const next = new Set(openSteps)
    next.has(id) ? next.delete(id) : next.add(id)
    setOpenSteps(next)
  }

  const handleAnswer = (questionId: string, answerId: string) => {
    if (submitted[questionId]) return
    const newAnswers = { ...answers, [questionId]: answerId }
    const newSubmitted = { ...submitted, [questionId]: true }
    setAnswers(newAnswers)
    setSubmitted(newSubmitted)
    if (Object.keys(newSubmitted).length === questions.length) {
      const correct = questions.filter((q) => newAnswers[q.id] === q.correctId).length
      recordQuizScore("6.1", correct, questions.length)
      if (correct === questions.length) {
        completeLevel("6.1")
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

      {/* Steps */}
      <div className="mb-8 space-y-3">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("steps.heading")}
        </h2>
        {steps.map((step, idx) => {
          const isOpen = openSteps.has(step.id)
          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                    isOpen ? "bg-pink-500/20 text-pink-400" : "bg-muted text-muted-foreground",
                  )}
                >
                  {isOpen ? <CheckCircle2 className="h-4 w-4" /> : step.number}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      "mt-1 w-px flex-1 min-h-[1.5rem]",
                      isOpen ? "bg-pink-500/30" : "bg-border/50",
                    )}
                  />
                )}
              </div>
              <Card
                className={cn(
                  "mb-2 flex-1 overflow-hidden border-border/50 bg-card/50 transition-colors",
                  isOpen && "border-pink-500/30",
                )}
              >
                <button
                  onClick={() => toggleStep(step.id)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-500/20">
                    <Zap className="h-4 w-4 text-pink-400" />
                  </div>
                  <p className="flex-1 text-sm font-medium">
                    {t(step.title as Parameters<typeof t>[0])}
                  </p>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-t border-border/50 px-4 py-3 space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {t(step.explanation as Parameters<typeof t>[0])}
                        </p>
                        {step.code && (
                          <div className="rounded-lg border border-border/50 bg-gray-950 p-3">
                            <pre className="font-mono text-xs leading-relaxed text-green-400 overflow-x-auto">
                              {step.code}
                            </pre>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          )
        })}
      </div>

      {!allStepsRead && (
        <div className="mb-6 rounded-lg border border-pink-500/30 bg-pink-500/5 p-4 text-center text-sm text-pink-300">
          {t("steps.unlock", {
            total: steps.length,
            read: openSteps.size,
          })}
        </div>
      )}

      {/* Quiz */}
      <AnimatePresence>
        {allStepsRead && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
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
                                showCorrect
                                  ? "bg-green-500/20"
                                  : showWrong
                                    ? "bg-red-500/20"
                                    : "bg-muted",
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
                              {userAnswer === q.correctId
                                ? t("quiz.correctPrefix")
                                : t("quiz.wrongPrefix")}
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

            <AnimatePresence>
              {allAnswered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card
                    className={cn(
                      "border",
                      allCorrect
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-amber-500/30 bg-amber-500/5",
                    )}
                  >
                    <CardContent className="py-6 text-center">
                      {allCorrect ? (
                        <>
                          <Code2 className="mx-auto mb-3 h-10 w-10 text-green-500" />
                          <h3 className="mb-2 text-xl font-bold">{t("result.successTitle")}</h3>
                          <p className="mb-6 text-sm text-muted-foreground">
                            {t("result.successBody")}
                          </p>
                          <Button asChild>
                            <Link to="/app/level/6.2">
                              {t("result.continue")}
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="mb-4 text-sm text-muted-foreground">
                            {t("result.retryBody")}
                          </p>
                          <Button variant="outline" onClick={reset}>
                            {t("result.tryAgain")}
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
