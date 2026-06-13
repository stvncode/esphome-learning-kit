import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteClassroom, getClassroom, leaveClassroom } from "@/lib/api"
import { TOTAL_LEVELS } from "@/lib/achievements"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Check, Copy, Loader2, LogOut, Trash2, Trophy, Users } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

const MEDALS = ["🥇", "🥈", "🥉"]

export function Classroom() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const { data: room, isLoading, isError } = useQuery({
    queryKey: ["classroom", id],
    queryFn: () => getClassroom(id!),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteClassroom(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] })
      toast.success("Class deleted")
      navigate("/app/classes")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const leaveMutation = useMutation({
    mutationFn: () => leaveClassroom(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] })
      toast.success("Left the class")
      navigate("/app/classes")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) {
    return (
      <div className="flex h-[calc(100svh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !room) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 text-center">
        <p className="text-muted-foreground">This class couldn't be loaded.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/app/classes">Back to Classes</Link>
        </Button>
      </div>
    )
  }

  const isTeacher = room.role === "teacher"

  const copyCode = () => {
    navigator.clipboard.writeText(room.code)
    setCopied(true)
    toast.success("Class code copied")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <div>
        <Link
          to="/app/classes"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Classes
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{room.name}</h1>
              <Badge variant={isTeacher ? "default" : "secondary"} className="capitalize">
                {room.role}
              </Badge>
            </div>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {room.members.length} student{room.members.length !== 1 ? "s" : ""}
            </p>
          </div>
          {isTeacher ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2 font-mono tracking-widest" onClick={copyCode}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {room.code}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-400 hover:text-red-400"
                onClick={() => {
                  if (confirm("Delete this class? This can't be undone.")) deleteMutation.mutate()
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="gap-2 text-red-400" onClick={() => leaveMutation.mutate()}>
              <LogOut className="h-4 w-4" />
              Leave class
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-amber-500" />
            Leaderboard
          </CardTitle>
          <CardDescription className="text-xs">
            Ranked by levels completed, then achievements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {room.members.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No students yet. {isTeacher && "Share the class code to get started."}
            </p>
          ) : (
            <div className="space-y-1">
              {room.members.map((m, i) => (
                <div
                  key={m.userId}
                  className="flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2.5"
                >
                  <span className="w-6 text-center text-sm font-semibold">
                    {MEDALS[i] ?? <span className="text-muted-foreground">{i + 1}</span>}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{m.name}</span>
                  <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      <span className="font-semibold text-foreground">{m.completedCount}</span>/{TOTAL_LEVELS} levels
                    </span>
                    <span className="hidden sm:inline">🏆 {m.achievementCount}</span>
                    {m.averageQuizScore !== null && (
                      <span className="hidden sm:inline">📊 {m.averageQuizScore}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
