import type { Achievement, Progress } from "@esphome-learning-kit/types"

type ProgressSnapshot = Pick<Progress, "completedLevels" | "streak">

interface AchievementDef {
  id: string
  title: string
  description: string
  icon: string
  earned: (p: ProgressSnapshot) => boolean
}

/** The levels that make up each phase — the source of truth for the curriculum size. */
const PHASE_LEVELS: Record<number, string[]> = {
  1: ["1.1", "1.2", "1.3", "1.4"],
  2: ["2.1", "2.2", "2.3", "2.4"],
  3: ["3.1", "3.2", "3.3", "3.4", "3.5"],
  4: ["4.1", "4.2", "4.3", "4.4"],
  5: ["5.1", "5.2"],
  6: ["6.1", "6.2", "6.3"],
}

export const TOTAL_LEVELS = Object.values(PHASE_LEVELS).reduce((n, l) => n + l.length, 0)

const phaseComplete = (p: ProgressSnapshot, phase: number) =>
  PHASE_LEVELS[phase].every((l) => p.completedLevels.includes(l))

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-steps", title: "First Steps", description: "Complete your first level", icon: "🎯", earned: (p) => p.completedLevels.length >= 1 },
  { id: "phase-1", title: "Visual Thinker", description: "Finish Phase 1", icon: "💡", earned: (p) => phaseComplete(p, 1) },
  { id: "phase-2", title: "Code Reader", description: "Finish Phase 2", icon: "📖", earned: (p) => phaseComplete(p, 2) },
  { id: "phase-3", title: "Confident Editor", description: "Finish Phase 3", icon: "✏️", earned: (p) => phaseComplete(p, 3) },
  { id: "phase-4", title: "From Scratch", description: "Finish Phase 4", icon: "🔨", earned: (p) => phaseComplete(p, 4) },
  { id: "phase-5", title: "Operator", description: "Finish Phase 5", icon: "📡", earned: (p) => phaseComplete(p, 5) },
  { id: "phase-6", title: "Power User", description: "Finish Phase 6", icon: "✨", earned: (p) => phaseComplete(p, 6) },
  { id: "halfway", title: "Halfway There", description: "Complete half the curriculum", icon: "⚡", earned: (p) => p.completedLevels.length >= Math.ceil(TOTAL_LEVELS / 2) },
  { id: "streak-3", title: "On a Roll", description: "Reach a 3-day streak", icon: "🔥", earned: (p) => p.streak >= 3 },
  { id: "streak-7", title: "Dedicated", description: "Reach a 7-day streak", icon: "🏅", earned: (p) => p.streak >= 7 },
  { id: "graduate", title: "ESPHome Graduate", description: "Complete every level", icon: "🎓", earned: (p) => p.completedLevels.length >= TOTAL_LEVELS },
]

/** Achievements newly earned by `snapshot` that aren't already in `unlockedIds`. */
export function newlyEarned(snapshot: ProgressSnapshot, unlockedIds: Set<string>): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !unlockedIds.has(a.id) && a.earned(snapshot)).map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    icon: a.icon,
  }))
}
