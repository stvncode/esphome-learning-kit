// Pure, DB-free helpers for classroom standings — unit-tested in standings.test.ts.

export interface MemberRow {
  userId: string;
  name: string;
}

export interface ProgressRow {
  userId: string;
  completedLevels: string[];
  achievements: unknown[];
}

export interface QuizRow {
  userId: string;
  score: number;
  total: number;
}

export interface Standing {
  userId: string;
  name: string;
  completedCount: number;
  achievementCount: number;
  averageQuizScore: number | null;
}

/** Average quiz percentage (0–100, rounded) per user, from their recorded scores. */
export function quizAveragesByUser(rows: QuizRow[]): Map<string, number> {
  const acc = new Map<string, { sum: number; n: number }>();
  for (const r of rows) {
    if (r.total <= 0) continue;
    const cur = acc.get(r.userId) ?? { sum: 0, n: 0 };
    cur.sum += (r.score / r.total) * 100;
    cur.n += 1;
    acc.set(r.userId, cur);
  }
  return new Map(Array.from(acc, ([userId, { sum, n }]) => [userId, Math.round(sum / n)]));
}

/** Build leaderboard standings, ranked by levels completed then achievements. */
export function buildStandings(
  members: MemberRow[],
  progressRows: ProgressRow[],
  quizRows: QuizRow[],
): Standing[] {
  const progressByUser = new Map(progressRows.map((p) => [p.userId, p]));
  const quizAvg = quizAveragesByUser(quizRows);

  return members
    .map((m) => {
      const p = progressByUser.get(m.userId);
      return {
        userId: m.userId,
        name: m.name,
        completedCount: p?.completedLevels.length ?? 0,
        achievementCount: p?.achievements.length ?? 0,
        averageQuizScore: quizAvg.get(m.userId) ?? null,
      };
    })
    .sort((a, b) => b.completedCount - a.completedCount || b.achievementCount - a.achievementCount);
}

export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

/** A 6-char join code. `bytes` is injectable for deterministic tests. */
export function generateCode(
  bytes: Uint8Array = crypto.getRandomValues(new Uint8Array(6)),
): string {
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}
