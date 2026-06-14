import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  ChevronRight,
  Code2,
  XCircle,
  Lightbulb,
  GitBranch,
  Home,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLevelT } from "@/lib/i18n"
import { useProgressStore } from "@/stores/progressStore"
import { useRecordQuizScore } from "@/lib/useQuizScore"
import { Link } from "react-router-dom"

interface Question {
  id: string
  question: string
  answers: { id: string; text: string }[]
  correctId: string
  explanation: string
}

// Note: text fields below are i18n KEY strings, resolved with t() at render time.
// Code-token answers (e.g. "if:", "condition:") are kept literal and not translated.
const questions: Question[] = [
  {
    id: "q1",
    question: "quiz.q1.question",
    answers: [
      { id: "a", text: "if:" },
      { id: "b", text: "condition:" },
      { id: "c", text: "when:" },
      { id: "d", text: "check:" },
    ],
    correctId: "b",
    explanation: "quiz.q1.explanation",
  },
  {
    id: "q2",
    question: "quiz.q2.question",
    answers: [
      { id: "a", text: "quiz.q2.answers.a" },
      { id: "b", text: "quiz.q2.answers.b" },
      { id: "c", text: "quiz.q2.answers.c" },
      { id: "d", text: "quiz.q2.answers.d" },
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
    correctId: "c",
    explanation: "quiz.q3.explanation",
  },
]

// Answer ids whose text is a literal code token (not an i18n key)
const codeAnswerQuestionIds = new Set(["q1"])

const exampleYaml = `binary_sensor:
  - platform: gpio
    pin: GPIO4
    name: "My Button"
    on_press:
      condition:
        binary_sensor.is_off: door_sensor
      then:
        - light.turn_on: my_light

binary_sensor:
  - platform: gpio
    pin: GPIO6
    name: "Door Sensor"
    id: door_sensor`

const getLineColor = (line: string) => {
  if (line.includes("binary_sensor:")) return "text-blue-400"
  if (line.includes("platform:")) return "text-cyan-400"
  if (line.includes("pin:")) return "text-green-400"
  if (line.includes("name:")) return "text-purple-400"
  if (line.includes("on_press:")) return "text-orange-400"
  if (line.includes("condition:")) return "text-yellow-400 font-semibold"
  if (line.includes("binary_sensor.is_off:")) return "text-yellow-300"
  if (line.includes("then:")) return "text-orange-400"
  if (line.includes("light.turn_on")) return "text-red-400"
  if (line.includes("id:")) return "text-pink-400"
  return "text-foreground"
}

export function Level3_5() {
  const t = useLevelT("3_5")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})
  const [, setLevelComplete] = useState(false)

  const { completeLevel, completedLevels } = useProgressStore()
  const recordQuizScore = useRecordQuizScore()
  const isCompleted = completedLevels.includes("3.5")

  const handleAnswer = (questionId: string, answerId: string) => {
    if (submitted[questionId]) return
    const newAnswers = { ...answers, [questionId]: answerId }
    const newSubmitted = { ...submitted, [questionId]: true }
    setAnswers(newAnswers)
    setSubmitted(newSubmitted)

    if (Object.keys(newSubmitted).length === questions.length) {
      const correct = questions.filter((q) => newAnswers[q.id] === q.correctId).length
      recordQuizScore("3.5", correct, questions.length)
      if (correct === questions.length) {
        setLevelComplete(true)
        completeLevel("3.5")
      }
    }
  }

  const allAnswered = Object.keys(submitted).length === questions.length
  const allCorrect = questions.every((q) => answers[q.id] === q.correctId)
  const correctCount = questions.filter((q) => answers[q.id] === q.correctId).length

  const reset = () => {
    setAnswers({})
    setSubmitted({})
    setLevelComplete(false)
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-400">{t("header.phase", { n: 3 })}</Badge>
          <Badge variant="outline">{t("header.level", { n: "3.5" })}</Badge>
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

      {/* Explanation card */}
      <Card className="mb-6 border-green-500/30 bg-green-500/5">
        <CardContent className="flex items-start gap-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/20">
            <GitBranch className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">{t("explanation.title")}</p>
            <p className="text-sm text-muted-foreground">
              {t("explanation.body1")}{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">then:</code>{" "}
              {t("explanation.body2")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Example YAML */}
      <Card className="mb-8 border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">{t("example.title")}</CardTitle>
          </div>
          <CardDescription className="text-xs">
            {t("example.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 bg-gray-100 dark:bg-gray-950 p-4">
            <pre className="font-mono text-sm">
              {exampleYaml.split("\n").map((line, i) => (
                <div key={i} className="leading-6">
                  <span className="mr-4 inline-block w-5 text-right text-xs text-muted-foreground/40">
                    {i + 1}
                  </span>
                  <span className={getLineColor(line)}>{line || "\u00A0"}</span>
                </div>
              ))}
            </pre>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
            <p className="text-xs text-muted-foreground">
              {t("example.hint1")}{" "}
              <span className="text-yellow-400 font-mono">condition:</span>{" "}
              {t("example.hint2")}{" "}
              <code className="font-mono">door_sensor</code>{" "}
              {t("example.hint3")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quiz */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">{t("quiz.heading", { n: questions.length })}</h2>

        {questions.map((q, qi) => {
          const userAnswer = answers[q.id]
          const isSubmitted = submitted[q.id]

          return (
            <Card key={q.id} className={cn(
              "border-border/50 bg-card/50",
              isSubmitted && userAnswer === q.correctId && "border-green-500/30",
              isSubmitted && userAnswer !== q.correctId && "border-red-500/30"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    isSubmitted && userAnswer === q.correctId ? "bg-green-500/20 text-green-400" :
                    isSubmitted && userAnswer !== q.correctId ? "bg-red-500/20 text-red-400" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {qi + 1}
                  </div>
                  <CardTitle className="text-sm leading-relaxed">{t(q.question as Parameters<typeof t>[0])}</CardTitle>
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
                                : "border-border/50 hover:border-border hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                          showCorrect ? "bg-green-500/20" : showWrong ? "bg-red-500/20" : "bg-muted"
                        )}>
                          {showCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : showWrong ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            answer.id.toUpperCase()
                          )}
                        </div>
                        {codeAnswerQuestionIds.has(q.id)
                          ? answer.text
                          : t(answer.text as Parameters<typeof t>[0])}
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
                      <div className={cn(
                        "rounded-lg p-3 text-xs",
                        userAnswer === q.correctId
                          ? "border border-green-500/30 bg-green-500/5 text-green-300"
                          : "border border-red-500/30 bg-red-500/5 text-red-300"
                      )}>
                        <span className="font-medium">
                          {userAnswer === q.correctId ? t("quiz.correctPrefix") : t("quiz.wrongPrefix")}
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
      </div>

      {/* Results */}
      <AnimatePresence>
        {allAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className={cn(
              "border",
              allCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
            )}>
              <CardContent className="py-6 text-center">
                <div className={cn(
                  "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                  allCorrect ? "bg-green-500/20" : "bg-amber-500/20"
                )}>
                  {allCorrect ? (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  ) : (
                    <span className="text-2xl font-bold text-amber-400">
                      {correctCount}/{questions.length}
                    </span>
                  )}
                </div>
                <h3 className="mb-2 text-xl font-bold">
                  {allCorrect ? t("results.perfectTitle") : t("results.scoreTitle", { n: correctCount, total: questions.length })}
                </h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  {allCorrect
                    ? t("results.perfectBody")
                    : t("results.retryBody", { total: questions.length })}
                </p>
                <div className="flex justify-center gap-3">
                  {!allCorrect && (
                    <Button variant="outline" onClick={reset}>
                      {t("buttons.tryAgain")}
                    </Button>
                  )}
                  {allCorrect && (
                    <Button asChild>
                      <Link to="/">
                        <Home className="mr-2 h-4 w-4" />
                        {t("buttons.backToHome")}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
