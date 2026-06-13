import { putProgress } from "@/lib/api"
import type { Achievement, Progress } from "@esphome-learning-kit/types"
import { create } from "zustand"

export type { Achievement } from "@esphome-learning-kit/types"

interface ProgressState {
  completedLevels: string[]
  currentLevel: string | null
  streak: number
  lastActivityDate: string | null
  achievements: Achievement[]
  /** True once server progress has been loaded into the store. */
  loaded: boolean

  // Actions
  hydrate: (progress: Progress) => void
  completeLevel: (levelId: string) => void
  setCurrentLevel: (levelId: string) => void
  unlockAchievement: (achievement: Achievement) => void
  resetProgress: () => void
}

const snapshot = (s: ProgressState): Progress => ({
  completedLevels: s.completedLevels,
  currentLevel: s.currentLevel,
  streak: s.streak,
  lastActivityDate: s.lastActivityDate,
  achievements: s.achievements,
})

export const useProgressStore = create<ProgressState>()((set, get) => {
  /** Persist the current snapshot to the backend (best-effort). */
  const sync = () => {
    if (!get().loaded) return
    void putProgress(snapshot(get())).catch(() => {
      // Best-effort: local state remains authoritative until the next mutation.
    })
  }

  /** Daily streak bookkeeping, returned as a partial state patch. */
  const computeStreak = (): Partial<ProgressState> => {
    const today = new Date().toDateString()
    const { lastActivityDate, streak } = get()
    if (lastActivityDate === today) return {}

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (lastActivityDate === yesterday.toDateString()) {
      return { streak: streak + 1, lastActivityDate: today }
    }
    return { streak: 1, lastActivityDate: today }
  }

  return {
    completedLevels: [],
    currentLevel: null,
    streak: 1,
    lastActivityDate: null,
    achievements: [],
    loaded: false,

    hydrate: (progress) =>
      set({
        completedLevels: progress.completedLevels,
        currentLevel: progress.currentLevel,
        streak: progress.streak,
        lastActivityDate: progress.lastActivityDate,
        achievements: progress.achievements,
        loaded: true,
      }),

    completeLevel: (levelId) => {
      if (get().completedLevels.includes(levelId)) return
      set((s) => ({ completedLevels: [...s.completedLevels, levelId], ...computeStreak() }))
      sync()
    },

    setCurrentLevel: (levelId) => {
      set({ currentLevel: levelId })
      sync()
    },

    unlockAchievement: (achievement) => {
      if (get().achievements.find((a) => a.id === achievement.id)) return
      set((s) => ({
        achievements: [...s.achievements, { ...achievement, unlockedAt: new Date().toISOString() }],
      }))
      sync()
    },

    resetProgress: () => {
      set({
        completedLevels: [],
        currentLevel: null,
        streak: 1,
        lastActivityDate: null,
        achievements: [],
      })
      sync()
    },
  }
})
