import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Lightbulb,
  MousePointerClick,
  Eye,
  Code2,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLevelT } from "@/lib/i18n"
import { useProgressStore } from "@/stores/progressStore"
import { Link } from "react-router-dom"

// Visual blocks with their corresponding YAML sections
interface VisualBlock {
  id: string
  type: "button" | "light" | "automation"
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  yamlLines: number[]
}

const visualBlocks: VisualBlock[] = [
  {
    id: "button",
    type: "button",
    label: "blocks.button.label",
    icon: CircleDot,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500",
    yamlLines: [1, 2, 3, 4, 5], // binary_sensor section
  },
  {
    id: "automation",
    type: "automation",
    label: "blocks.automation.label",
    icon: MousePointerClick,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500",
    yamlLines: [6, 7, 8], // on_press section
  },
  {
    id: "light",
    type: "light",
    label: "blocks.light.label",
    icon: Lightbulb,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500",
    yamlLines: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], // light + output sections
  },
]

interface YamlLine {
  number: number
  content: string
  color: string
  blockId: string | null
  explanation?: string
}

const yamlLines: YamlLine[] = [
  {
    number: 1,
    content: "# 🔵 This defines your button",
    color: "text-blue-400",
    blockId: "button",
    explanation: "yaml.l1",
  },
  {
    number: 2,
    content: "binary_sensor:",
    color: "text-blue-400",
    blockId: "button",
    explanation: "yaml.l2",
  },
  {
    number: 3,
    content: "  - platform: gpio",
    color: "text-blue-400",
    blockId: "button",
    explanation: "yaml.l3",
  },
  {
    number: 4,
    content: '    pin: GPIO4',
    color: "text-blue-400",
    blockId: "button",
    explanation: "yaml.l4",
  },
  {
    number: 5,
    content: '    name: "My Button"',
    color: "text-blue-400",
    blockId: "button",
    explanation: "yaml.l5",
  },
  {
    number: 6,
    content: "    on_press:",
    color: "text-green-400",
    blockId: "automation",
    explanation: "yaml.l6",
  },
  {
    number: 7,
    content: "      then:",
    color: "text-green-400",
    blockId: "automation",
    explanation: "yaml.l7",
  },
  {
    number: 8,
    content: "        - light.turn_on: my_light",
    color: "text-green-400",
    blockId: "automation",
    explanation: "yaml.l8",
  },
  {
    number: 9,
    content: "",
    color: "text-gray-500",
    blockId: null,
  },
  {
    number: 10,
    content: "# 🟡 This defines your light",
    color: "text-amber-400",
    blockId: "light",
    explanation: "yaml.l10",
  },
  {
    number: 11,
    content: "light:",
    color: "text-amber-400",
    blockId: "light",
    explanation: "yaml.l11",
  },
  {
    number: 12,
    content: "  - platform: binary",
    color: "text-amber-400",
    blockId: "light",
    explanation: "yaml.l12",
  },
  {
    number: 13,
    content: '    name: "My Light"',
    color: "text-amber-400",
    blockId: "light",
    explanation: "yaml.l13",
  },
  {
    number: 14,
    content: "    id: my_light",
    color: "text-amber-400",
    blockId: "light",
    explanation: "yaml.l14",
  },
  {
    number: 15,
    content: "    output: light_output",
    color: "text-amber-400",
    blockId: "light",
    explanation: "yaml.l15",
  },
  {
    number: 16,
    content: "",
    color: "text-gray-500",
    blockId: null,
  },
  {
    number: 17,
    content: "output:",
    color: "text-amber-400",
    blockId: "light",
    explanation: "yaml.l17",
  },
  {
    number: 18,
    content: "  - platform: gpio",
    color: "text-amber-400",
    blockId: "light",
    explanation: "yaml.l18",
  },
  {
    number: 19,
    content: "    pin: GPIO5",
    color: "text-amber-400",
    blockId: "light",
    explanation: "yaml.l19",
  },
  {
    number: 20,
    content: "    id: light_output",
    color: "text-amber-400",
    blockId: "light",
    explanation: "yaml.l20",
  },
]

export function Level2_1() {
  const t = useLevelT("2_1")
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null)
  const [hoveredLine, setHoveredLine] = useState<number | null>(null)
  const [revealedLines, setRevealedLines] = useState<number[]>([])
  const [isRevealing, setIsRevealing] = useState(false)
  const [hasRevealedAll, setHasRevealedAll] = useState(false)

  const { completeLevel, completedLevels } = useProgressStore()
  const isCompleted = completedLevels.includes("2.1")

  // Get the block for a hovered line
  const getBlockForLine = (lineNum: number): string | null => {
    const line = yamlLines.find((l) => l.number === lineNum)
    return line?.blockId ?? null
  }

  // Check if a line should be highlighted
  const isLineHighlighted = (lineNum: number): boolean => {
    if (hoveredBlock) {
      const block = visualBlocks.find((b) => b.id === hoveredBlock)
      return block?.yamlLines.includes(lineNum) ?? false
    }
    if (hoveredLine) {
      const blockId = getBlockForLine(hoveredLine)
      if (blockId) {
        const block = visualBlocks.find((b) => b.id === blockId)
        return block?.yamlLines.includes(lineNum) ?? false
      }
    }
    return false
  }

  // Check if a block should be highlighted
  const isBlockHighlighted = (blockId: string): boolean => {
    if (hoveredBlock === blockId) return true
    if (hoveredLine) {
      return getBlockForLine(hoveredLine) === blockId
    }
    return false
  }

  // Reveal animation
  const startReveal = useCallback(() => {
    setIsRevealing(true)
    setRevealedLines([])

    yamlLines.forEach((line, index) => {
      setTimeout(() => {
        setRevealedLines((prev) => [...prev, line.number])
        if (index === yamlLines.length - 1) {
          setIsRevealing(false)
          setHasRevealedAll(true)
          completeLevel("2.1")
        }
      }, index * 100)
    })
  }, [completeLevel])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-[calc(100svh-4rem)] flex-col p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge className="bg-blue-500/20 text-blue-400">{t("header.phase")}</Badge>
            <Badge variant="outline">{t("header.level")}</Badge>
            {isCompleted && (
              <Badge className="bg-green-500/20 text-green-400">
                <CheckCircle2 className="mr-1 h-3 w-3" /> {t("header.completed")}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">{t("header.title")}</h1>
          <p className="text-muted-foreground">
            {t("header.subtitle")}
          </p>
        </div>

        {/* Main content - Split view */}
        <div className="grid flex-1 gap-6 lg:grid-cols-2" style={{ minHeight: 0 }}>
          {/* Visual Side */}
          <Card className="flex flex-col border-border/50 bg-card/50 min-h-0">
            <CardHeader className="pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">{t("visual.title")}</CardTitle>
              </div>
              <CardDescription className="text-xs">
                {t("visual.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto min-h-0">
              <div className="flex flex-col items-center gap-8 py-4">
                {/* Button Block */}
                <motion.div
                  onMouseEnter={() => setHoveredBlock("button")}
                  onMouseLeave={() => setHoveredBlock(null)}
                  animate={isBlockHighlighted("button") ? { scale: 1.05 } : { scale: 1 }}
                  className={cn(
                    "relative flex w-48 flex-col items-center rounded-xl border-2 bg-gradient-to-b from-blue-950 to-blue-900 p-4 transition-all cursor-pointer",
                    isBlockHighlighted("button")
                      ? "border-blue-400 shadow-lg shadow-blue-500/30"
                      : "border-blue-800"
                  )}
                >
                  {isBlockHighlighted("button") && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 -z-10 rounded-xl bg-blue-400/20 blur-xl"
                    />
                  )}
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                    <CircleDot className="h-6 w-6 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-blue-100">{t("blocks.button.label")}</span>
                  <span className="text-xs text-blue-400/70">GPIO4</span>
                  <Badge className="absolute -top-2 bg-blue-500 text-[10px]">
                    {t("blocks.button.badge")}
                  </Badge>
                </motion.div>

                {/* Arrow + Automation */}
                <motion.div
                  onMouseEnter={() => setHoveredBlock("automation")}
                  onMouseLeave={() => setHoveredBlock(null)}
                  animate={isBlockHighlighted("automation") ? { scale: 1.05 } : { scale: 1 }}
                  className={cn(
                    "relative flex w-48 flex-col items-center rounded-xl border-2 bg-gradient-to-b from-green-950 to-green-900 p-4 transition-all cursor-pointer",
                    isBlockHighlighted("automation")
                      ? "border-green-400 shadow-lg shadow-green-500/30"
                      : "border-green-800"
                  )}
                >
                  {isBlockHighlighted("automation") && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 -z-10 rounded-xl bg-green-400/20 blur-xl"
                    />
                  )}
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                    <MousePointerClick className="h-6 w-6 text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-green-100">{t("blocks.automation.label")}</span>
                  <span className="text-xs text-green-400/70">then → turn_on</span>
                  <Badge className="absolute -top-2 bg-green-500 text-[10px]">
                    {t("blocks.automation.badge")}
                  </Badge>
                </motion.div>

                {/* Light Block */}
                <motion.div
                  onMouseEnter={() => setHoveredBlock("light")}
                  onMouseLeave={() => setHoveredBlock(null)}
                  animate={isBlockHighlighted("light") ? { scale: 1.05 } : { scale: 1 }}
                  className={cn(
                    "relative flex w-48 flex-col items-center rounded-xl border-2 bg-gradient-to-b from-amber-950 to-amber-900 p-4 transition-all cursor-pointer",
                    isBlockHighlighted("light")
                      ? "border-amber-400 shadow-lg shadow-amber-500/30"
                      : "border-amber-800"
                  )}
                >
                  {isBlockHighlighted("light") && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 -z-10 rounded-xl bg-amber-400/20 blur-xl"
                    />
                  )}
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20">
                    <Lightbulb className="h-6 w-6 text-amber-400" />
                  </div>
                  <span className="text-sm font-medium text-amber-100">{t("blocks.light.label")}</span>
                  <span className="text-xs text-amber-400/70">GPIO5</span>
                  <Badge className="absolute -top-2 bg-amber-500 text-[10px]">
                    {t("blocks.light.badge")}
                  </Badge>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* YAML Side */}
          <Card className="flex flex-col border-border/50 bg-card/50 min-h-0">
            <CardHeader className="pb-3 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm">{t("code.title")}</CardTitle>
                </div>
                {!hasRevealedAll && (
                  <Button
                    size="sm"
                    onClick={startReveal}
                    disabled={isRevealing}
                  >
                    <Sparkles className="mr-2 h-3 w-3" />
                    {isRevealing ? t("code.revealing") : t("code.reveal")}
                  </Button>
                )}
              </div>
              <CardDescription className="text-xs">
                {t("code.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden min-h-0">
              <ScrollArea className="h-full rounded-lg border border-border/50 bg-gray-100 dark:bg-gray-950 p-4">
                <pre className="font-mono text-sm">
                  {yamlLines.map((line) => {
                    const isHighlighted = isLineHighlighted(line.number)
                    const isRevealed = hasRevealedAll || revealedLines.includes(line.number)

                    if (!isRevealed) {
                      return (
                        <div key={line.number} className="h-6 leading-6">
                          <span className="mr-4 inline-block w-6 text-right text-gray-600">
                            {line.number}
                          </span>
                          <span className="text-gray-800">
                            {"█".repeat(Math.min(line.content.length, 30))}
                          </span>
                        </div>
                      )
                    }

                    return (
                      <Tooltip key={line.number}>
                        <TooltipTrigger asChild>
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onMouseEnter={() => setHoveredLine(line.number)}
                            onMouseLeave={() => setHoveredLine(null)}
                            className={cn(
                              "h-6 leading-6 rounded transition-colors cursor-help",
                              isHighlighted && "bg-white/5"
                            )}
                          >
                            <span
                              className={cn(
                                "mr-4 inline-block w-6 text-right transition-colors",
                                isHighlighted ? "text-gray-400" : "text-gray-600"
                              )}
                            >
                              {line.number}
                            </span>
                            <span
                              className={cn(
                                "transition-colors",
                                isHighlighted ? line.color : "text-gray-400"
                              )}
                            >
                              {line.content}
                            </span>
                          </motion.div>
                        </TooltipTrigger>
                        {line.explanation && (
                          <TooltipContent
                            side="right"
                            className="max-w-xs bg-gray-900 text-sm"
                          >
                            <p>{t(line.explanation as Parameters<typeof t>[0])}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )
                  })}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Legend & Next */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-500" />
              <span className="text-xs text-muted-foreground">{t("legend.input")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span className="text-xs text-muted-foreground">{t("legend.automation")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-amber-500" />
              <span className="text-xs text-muted-foreground">{t("legend.output")}</span>
            </div>
          </div>

          {hasRevealedAll && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button asChild>
                <Link to="/app/level/2.2">
                  {t("buttons.continue")}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
