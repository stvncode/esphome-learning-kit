import { describe, expect, test } from "bun:test"
import { ACHIEVEMENTS, newlyEarned, TOTAL_LEVELS } from "./achievements"

const ALL_LEVELS = [
  "1.1", "1.2", "1.3", "1.4",
  "2.1", "2.2", "2.3", "2.4",
  "3.1", "3.2", "3.3", "3.4", "3.5",
  "4.1", "4.2", "4.3", "4.4",
  "5.1", "5.2",
  "6.1", "6.2", "6.3",
]

describe("achievements", () => {
  test("TOTAL_LEVELS matches the curriculum (22)", () => {
    expect(TOTAL_LEVELS).toBe(22)
    expect(ALL_LEVELS.length).toBe(22)
  })

  test("first level unlocks First Steps only", () => {
    const earned = newlyEarned({ completedLevels: ["1.1"], streak: 1 }, new Set())
    expect(earned.map((a) => a.id)).toEqual(["first-steps"])
  })

  test("finishing phase 1 unlocks the phase-1 achievement", () => {
    const earned = newlyEarned({ completedLevels: ["1.1", "1.2", "1.3", "1.4"], streak: 1 }, new Set())
    expect(earned.map((a) => a.id)).toContain("phase-1")
  })

  test("already-unlocked achievements are not returned again", () => {
    const earned = newlyEarned(
      { completedLevels: ["1.1"], streak: 1 },
      new Set(["first-steps"]),
    )
    expect(earned).toEqual([])
  })

  test("streak milestones unlock", () => {
    expect(newlyEarned({ completedLevels: ["1.1"], streak: 3 }, new Set(["first-steps"])).map((a) => a.id)).toContain("streak-3")
    expect(newlyEarned({ completedLevels: ["1.1"], streak: 7 }, new Set(["first-steps", "streak-3"])).map((a) => a.id)).toContain("streak-7")
  })

  test("halfway unlocks at 11 levels", () => {
    const half = ALL_LEVELS.slice(0, 11)
    expect(newlyEarned({ completedLevels: half, streak: 1 }, new Set()).map((a) => a.id)).toContain("halfway")
  })

  test("completing everything unlocks graduate and every achievement", () => {
    const earned = newlyEarned({ completedLevels: ALL_LEVELS, streak: 1 }, new Set())
    const ids = earned.map((a) => a.id)
    expect(ids).toContain("graduate")
    // every non-streak-7 achievement should be earned (streak is only 1 here)
    expect(ids).toContain("first-steps")
    expect(ids).toContain("phase-6")
    expect(ids).not.toContain("streak-7")
  })

  test("achievement ids are unique", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
