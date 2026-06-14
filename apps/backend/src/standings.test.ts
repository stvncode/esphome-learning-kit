import { describe, expect, test } from "bun:test"
import { buildStandings, CODE_ALPHABET, generateCode, quizAveragesByUser } from "./standings.ts"

describe("quizAveragesByUser", () => {
  test("averages percentages per user and rounds", () => {
    const avg = quizAveragesByUser([
      { userId: "a", score: 2, total: 4 }, // 50
      { userId: "a", score: 3, total: 3 }, // 100  -> avg 75
      { userId: "b", score: 1, total: 3 }, // 33.3 -> 33
    ])
    expect(avg.get("a")).toBe(75)
    expect(avg.get("b")).toBe(33)
  })

  test("ignores rows with non-positive totals", () => {
    const avg = quizAveragesByUser([{ userId: "a", score: 0, total: 0 }])
    expect(avg.has("a")).toBe(false)
  })
})

describe("buildStandings", () => {
  const members = [
    { userId: "a", name: "Ada" },
    { userId: "b", name: "Bo" },
    { userId: "c", name: "Cy" },
  ]

  test("ranks by completed levels, then achievements", () => {
    const standings = buildStandings(
      members,
      [
        { userId: "a", completedLevels: ["1.1"], achievements: [] },
        { userId: "b", completedLevels: ["1.1", "1.2", "1.3"], achievements: [{}, {}] },
        { userId: "c", completedLevels: ["1.1", "1.2", "1.3"], achievements: [{}] },
      ],
      [],
    )
    expect(standings.map((s) => s.userId)).toEqual(["b", "c", "a"]) // b & c tie on levels, b wins on achievements
  })

  test("members with no progress show zeros and null quiz average", () => {
    const [only] = buildStandings([{ userId: "x", name: "X" }], [], [])
    expect(only).toEqual({
      userId: "x",
      name: "X",
      completedCount: 0,
      achievementCount: 0,
      averageQuizScore: null,
    })
  })

  test("attaches quiz averages when present", () => {
    const [s] = buildStandings(
      [{ userId: "a", name: "Ada" }],
      [{ userId: "a", completedLevels: [], achievements: [] }],
      [{ userId: "a", score: 1, total: 2 }],
    )
    expect(s.averageQuizScore).toBe(50)
  })
})

describe("generateCode", () => {
  test("is 6 chars from the alphabet", () => {
    const code = generateCode()
    expect(code).toHaveLength(6)
    expect([...code].every((ch) => CODE_ALPHABET.includes(ch))).toBe(true)
  })
})
