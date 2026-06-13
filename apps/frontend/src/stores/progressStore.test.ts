import { beforeEach, describe, expect, mock, test } from "bun:test"

// Mock the network + toast layers so the store is tested in isolation.
const putProgress = mock(async (p: unknown) => p)
mock.module("@/lib/api", () => ({ putProgress }))
mock.module("sonner", () => ({ toast: { success: mock(() => {}), error: mock(() => {}) } }))

const { useProgressStore } = await import("./progressStore")

const reset = () =>
  useProgressStore.setState({
    completedLevels: [],
    currentLevel: null,
    streak: 1,
    lastActivityDate: null,
    achievements: [],
    loaded: false,
  })

describe("progressStore", () => {
  beforeEach(() => {
    reset()
    putProgress.mockClear()
  })

  test("does not sync before hydration", () => {
    useProgressStore.getState().completeLevel("1.1")
    expect(putProgress).not.toHaveBeenCalled()
    expect(useProgressStore.getState().completedLevels).toEqual(["1.1"])
  })

  test("hydrate loads server progress and flips loaded", () => {
    useProgressStore.getState().hydrate({
      completedLevels: ["1.1"],
      currentLevel: "1.2",
      streak: 5,
      lastActivityDate: "Sat Jun 13 2026",
      achievements: [],
    })
    const s = useProgressStore.getState()
    expect(s.loaded).toBe(true)
    expect(s.streak).toBe(5)
  })

  test("completeLevel after hydration persists and is idempotent", () => {
    const { hydrate } = useProgressStore.getState()
    hydrate({ completedLevels: [], currentLevel: null, streak: 1, lastActivityDate: null, achievements: [] })

    useProgressStore.getState().completeLevel("1.1")
    expect(useProgressStore.getState().completedLevels).toEqual(["1.1"])
    expect(putProgress).toHaveBeenCalledTimes(1)

    // Completing the same level again is a no-op (no extra sync).
    useProgressStore.getState().completeLevel("1.1")
    expect(useProgressStore.getState().completedLevels).toEqual(["1.1"])
    expect(putProgress).toHaveBeenCalledTimes(1)
  })

  test("completeLevel unlocks the first-steps achievement", () => {
    const { hydrate } = useProgressStore.getState()
    hydrate({ completedLevels: [], currentLevel: null, streak: 1, lastActivityDate: null, achievements: [] })

    useProgressStore.getState().completeLevel("1.1")
    const ids = useProgressStore.getState().achievements.map((a) => a.id)
    expect(ids).toContain("first-steps")
  })

  test("clear wipes local state without syncing", () => {
    const { hydrate } = useProgressStore.getState()
    hydrate({ completedLevels: ["1.1"], currentLevel: null, streak: 3, lastActivityDate: null, achievements: [] })
    putProgress.mockClear()

    useProgressStore.getState().clear()
    const s = useProgressStore.getState()
    expect(s.loaded).toBe(false)
    expect(s.completedLevels).toEqual([])
    expect(s.streak).toBe(1)
    expect(putProgress).not.toHaveBeenCalled()
  })
})
