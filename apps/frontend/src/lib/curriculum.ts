export interface LevelMeta {
  id: string
  title: string
  phase: number
}

/** The full curriculum in order — the single source of truth for navigation. */
export const LEVEL_ORDER: LevelMeta[] = [
  { id: "1.1", title: "What is a smart device?", phase: 1 },
  { id: "1.2", title: "Meet your board", phase: 1 },
  { id: "1.3", title: "Your first flow", phase: 1 },
  { id: "1.4", title: "Adding timing", phase: 1 },
  { id: "2.1", title: "The YAML behind the magic", phase: 2 },
  { id: "2.2", title: "Understanding the structure", phase: 2 },
  { id: "2.3", title: "Spot the difference", phase: 2 },
  { id: "2.4", title: "Reading a complete config", phase: 2 },
  { id: "3.1", title: "Change the names", phase: 3 },
  { id: "3.2", title: "Change the pins", phase: 3 },
  { id: "3.3", title: "Change the behavior", phase: 3 },
  { id: "3.4", title: "Add a delay", phase: 3 },
  { id: "3.5", title: "Conditions", phase: 3 },
  { id: "4.1", title: "Fill in the blanks", phase: 4 },
  { id: "4.2", title: "Add a component", phase: 4 },
  { id: "4.3", title: "Create an automation", phase: 4 },
  { id: "4.4", title: "Write a complete config", phase: 4 },
  { id: "5.1", title: "Debug with logs", phase: 5 },
  { id: "5.2", title: "Integration with Home Assistant", phase: 5 },
  { id: "6.1", title: "Lambdas", phase: 6 },
  { id: "6.2", title: "Custom components", phase: 6 },
  { id: "6.3", title: "I2C and SPI devices", phase: 6 },
]

export const TOTAL_LEVELS = LEVEL_ORDER.length

export const levelIndex = (id: string) => LEVEL_ORDER.findIndex((l) => l.id === id)

export const levelMeta = (id: string): LevelMeta | undefined =>
  LEVEL_ORDER.find((l) => l.id === id)

/** The first level the student hasn't completed, or null if they've finished. */
export function nextIncompleteLevel(completed: string[]): LevelMeta | null {
  return LEVEL_ORDER.find((l) => !completed.includes(l.id)) ?? null
}

/** Where a student should resume: their last-visited level if unfinished, else the next gap. */
export function resumeLevel(completed: string[], currentLevel: string | null): LevelMeta | null {
  if (currentLevel && !completed.includes(currentLevel)) {
    const meta = levelMeta(currentLevel)
    if (meta) return meta
  }
  return nextIncompleteLevel(completed)
}
