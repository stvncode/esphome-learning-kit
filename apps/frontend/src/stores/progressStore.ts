import { newlyEarned } from "@/lib/achievements"
import { putProgress } from "@/lib/api"
import type { Achievement, Progress } from "@esphome-learning-kit/types"
import { toast } from "sonner"
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
  /** Wipe in-memory state on sign-out — does NOT touch server progress. */
  clear: () => void
}

const EMPTY = {
  completedLevels: [] as string[],
  currentLevel: null,
  streak: 1,
  lastActivityDate: null,
  achievements: [] as Achievement[],
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
      // Local state stays authoritative; warn once (deduped by toast id).
      toast.error("Couldn't save your progress — it may not persist.", { id: "progress-sync" })
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

      const streakPatch = computeStreak()
      const completedLevels = [...get().completedLevels, levelId]
      const streak = streakPatch.streak ?? get().streak

      const unlockedIds = new Set(get().achievements.map((a) => a.id))
      const earned = newlyEarned({ completedLevels, streak }, unlockedIds).map((a) => ({
        ...a,
        unlockedAt: new Date().toISOString(),
      }))

      set((s) => ({
        completedLevels,
        ...streakPatch,
        achievements: [...s.achievements, ...earned],
      }))
      earned.forEach((a) =>
        toast.success(`Achievement unlocked: ${a.title}`, { description: a.description, icon: a.icon }),
      )
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
      set({ ...EMPTY })
      sync()
    },

    clear: () => set({ ...EMPTY, loaded: false }),
  }
})
