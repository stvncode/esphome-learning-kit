import { putQuizScore } from "@/lib/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

/**
 * Returns a `record(levelId, score, total)` callback that persists a quiz
 * result to the backend (best score is kept server-side) and refreshes any
 * views that depend on it. Fire-and-forget — failures are non-blocking.
 */
export function useRecordQuizScore() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: putQuizScore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizScores"] })
      queryClient.invalidateQueries({ queryKey: ["classroom"] })
    },
  })

  return useCallback(
    (levelId: string, score: number, total: number) =>
      mutation.mutate({ levelId, score, total }),
    [mutation],
  )
}
