import { useDeleteConfirm } from "@/components/DeleteConfirmModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { TOTAL_LEVELS } from "@/lib/achievements"
import {
  deleteClassroom,
  getClassroom,
  getClassroomMember,
  leaveClassroom,
  removeClassroomMember,
  renameClassroom,
} from "@/lib/api"
import { levelMeta } from "@/lib/curriculum"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Check, Copy, Loader2, LogOut, Pencil, Trash2, Trophy, UserX } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

const MEDALS = ["🥇", "🥈", "🥉"]

export function Classroom() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [viewing, setViewing] = useState<{ userId: string; name: string } | null>(null)
  const { confirm, dialog: confirmDialog } = useDeleteConfirm()

  const { data: room, isLoading, isError } = useQuery({
    queryKey: ["classroom", id],
    queryFn: () => getClassroom(id!),
    enabled: !!id,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["classroom", id] })
    queryClient.invalidateQueries({ queryKey: ["classrooms"] })
  }

  const deleteMutation = useMutation({
    mutationFn: () => deleteClassroom(id!),
    onSuccess: () => {
      invalidate()
      toast.success("Class deleted")
      navigate("/app/classes")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const leaveMutation = useMutation({
    mutationFn: () => leaveClassroom(id!),
    onSuccess: () => {
      invalidate()
      toast.success("Left the class")
      navigate("/app/classes")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const renameMutation = useMutation({
    mutationFn: () => renameClassroom(id!, newName.trim()),
    onSuccess: () => {
      invalidate()
      setRenameOpen(false)
      toast.success("Class renamed")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeClassroomMember(id!, userId),
    onSuccess: () => {
      invalidate()
      toast.success("Student removed")
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
              {isTeacher && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    setNewName(room.name)
                    setRenameOpen(true)
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
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
                onClick={() =>
                  confirm({
                    title: "Delete this class?",
                    description:
                      "This permanently removes the class and all its memberships. This can't be undone.",
                    confirmLabel: "Delete class",
                    onConfirm: () => deleteMutation.mutateAsync(),
                  })
                }
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
            Ranked by levels completed, then achievements.{" "}
            {isTeacher && "Click a student to see details."}
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
                  className={`flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2.5 ${
                    isTeacher ? "cursor-pointer hover:border-border hover:bg-muted/30" : ""
                  }`}
                  onClick={() => isTeacher && setViewing({ userId: m.userId, name: m.name })}
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
                    {isTeacher && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation()
                          confirm({
                            title: `Remove ${m.name}?`,
                            description: `${m.name} will be removed from this class. They keep their own progress.`,
                            confirmLabel: "Remove student",
                            onConfirm: () => removeMutation.mutateAsync(m.userId),
                          })
                        }}
                      >
                        <UserX className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename class</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newName.trim() && renameMutation.mutate()}
          />
          <DialogFooter>
            <Button onClick={() => renameMutation.mutate()} disabled={!newName.trim() || renameMutation.isPending}>
              {renameMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student drill-down */}
      <StudentDetailDialog
        classId={id!}
        member={viewing}
        onClose={() => setViewing(null)}
      />

      {confirmDialog}
    </div>
  )
}

function StudentDetailDialog({
  classId,
  member,
  onClose,
}: {
  classId: string
  member: { userId: string; name: string } | null
  onClose: () => void
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["classroom", classId, "member", member?.userId],
    queryFn: () => getClassroomMember(classId, member!.userId),
    enabled: !!member,
  })

  return (
    <Dialog open={!!member} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{member?.name}</DialogTitle>
          <DialogDescription>Progress in this class</DialogDescription>
        </DialogHeader>
        {isLoading || !data ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <span>
                <span className="font-semibold">{data.completedLevels.length}</span>/{TOTAL_LEVELS} levels
              </span>
              <span>🏆 {data.achievementCount} achievements</span>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Completed levels</p>
              {data.completedLevels.length === 0 ? (
                <p className="text-xs text-muted-foreground">None yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {data.completedLevels.map((lvl) => (
                    <Badge key={lvl} variant="secondary" className="text-[10px]">
                      {lvl}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Quiz scores</p>
              {data.quizScores.length === 0 ? (
                <p className="text-xs text-muted-foreground">No quizzes taken yet.</p>
              ) : (
                <div className="space-y-1">
                  {data.quizScores.map((q) => (
                    <div key={q.levelId} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {q.levelId} · {levelMeta(q.levelId)?.title ?? "Quiz"}
                      </span>
                      <span className="font-medium">
                        {q.score}/{q.total}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
