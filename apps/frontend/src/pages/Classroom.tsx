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
  inviteStudents,
  leaveClassroom,
  removeClassroomMember,
  renameClassroom,
} from "@/lib/api"
import { useClassesT, useCurriculumLabels } from "@/lib/i18n"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Copy, Loader2, LogOut, Mail, Pencil, Trash2, Trophy, UserX, X } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

const MEDALS = ["🥇", "🥈", "🥉"]

export function Classroom() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const t = useClassesT()
  const [copied, setCopied] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [emails, setEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [viewing, setViewing] = useState<{ userId: string; name: string } | null>(null)
  const { confirm, dialog: confirmDialog } = useDeleteConfirm()

  const {
    data: room,
    isLoading,
    isError,
  } = useQuery({
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
      toast.success(t("toastDeleted"))
      navigate("/app/classes")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const leaveMutation = useMutation({
    mutationFn: () => leaveClassroom(id!),
    onSuccess: () => {
      invalidate()
      toast.success(t("toastLeft"))
      navigate("/app/classes")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const renameMutation = useMutation({
    mutationFn: () => renameClassroom(id!, newName.trim()),
    onSuccess: () => {
      invalidate()
      setRenameOpen(false)
      toast.success(t("toastRenamed"))
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeClassroomMember(id!, userId),
    onSuccess: () => {
      invalidate()
      toast.success(t("toastRemoved"))
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // Split a raw string on whitespace/comma/semicolon into normalized emails.
  const parseEmails = (raw: string) =>
    raw
      .split(/[\s,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)

  // Commit one or more emails to the chip list, de-duplicating against existing.
  const addEmails = (raw: string) => {
    const parts = parseEmails(raw)
    if (parts.length) setEmails((prev) => Array.from(new Set([...prev, ...parts])))
  }

  const removeEmail = (email: string) => setEmails((prev) => prev.filter((e) => e !== email))

  // Commit on change rather than keydown: a typed/pasted/autofilled delimiter
  // reliably lands in the value, whereas keydown can miss it (IME, mobile,
  // some keyboard locales). Whatever follows the last delimiter keeps typing.
  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/[\s,;]/.test(value)) {
      const parts = value.split(/[\s,;]+/)
      const trailing = parts.pop() ?? ""
      addEmails(parts.join(" "))
      setEmailInput(trailing)
    } else {
      setEmailInput(value)
    }
  }

  const onEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Enter doesn't alter the value, so commit it explicitly here.
      e.preventDefault()
      addEmails(emailInput)
      setEmailInput("")
    } else if (e.key === "Backspace" && !emailInput) {
      // Backspace on an empty input removes the last chip.
      setEmails((prev) => prev.slice(0, -1))
    }
  }

  const onEmailPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    addEmails(e.clipboardData.getData("text"))
  }

  const inviteMutation = useMutation({
    mutationFn: () => {
      // Include any text still in the input that wasn't turned into a chip yet.
      const all = Array.from(new Set([...emails, ...parseEmails(emailInput)]))
      if (all.length === 0) throw new Error("Enter at least one email address")
      return inviteStudents(id!, all)
    },
    onSuccess: ({ invited }) => {
      setInviteOpen(false)
      setEmails([])
      setEmailInput("")
      toast.success(t("toastInvited", { n: invited }))
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
      <div className="mx-auto max-w-7xl px-4 py-10 text-center">
        <p className="text-muted-foreground">{t("notLoaded")}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/app/classes">{t("backBtn")}</Link>
        </Button>
      </div>
    )
  }

  const isTeacher = room.role === "teacher"

  const copyCode = () => {
    navigator.clipboard.writeText(room.code)
    setCopied(true)
    toast.success(t("toastCodeCopied"))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{room.name}</h1>
              <Badge variant={isTeacher ? "default" : "secondary"}>
                {isTeacher ? t("roleTeacher") : t("roleStudent")}
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
              {t(room.members.length === 1 ? "student" : "students", { n: room.members.length })}
            </p>
          </div>
          {isTeacher ? (
            <div className="flex items-center gap-2">
              <Button className="gap-2" onClick={() => setInviteOpen(true)}>
                <Mail className="h-4 w-4" />
                {t("invite")}
              </Button>
              <Button
                variant="outline"
                className="gap-2 font-mono tracking-widest"
                onClick={copyCode}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {room.code}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-400 hover:text-red-400"
                onClick={() =>
                  confirm({
                    title: t("confirmDeleteTitle"),
                    description: t("confirmDeleteDesc"),
                    confirmLabel: t("delete"),
                    onConfirm: () => deleteMutation.mutateAsync(),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="gap-2 text-red-400"
              onClick={() => leaveMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
              {t("leave")}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-amber-500" />
            {t("leaderboard")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("leaderboardDesc")} {isTeacher && t("leaderboardHint")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {room.members.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("noStudents")} {isTeacher && t("noStudentsTeacher")}
            </p>
          ) : (
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {room.members.map((m, i) => (
                  <motion.div
                    layout
                    key={m.userId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ type: "spring", duration: 0.45, bounce: 0.2 }}
                    className={`flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2.5 ${
                      isTeacher ? "cursor-pointer hover:border-border hover:bg-muted/30" : ""
                    }`}
                    onClick={() => isTeacher && setViewing({ userId: m.userId, name: m.name })}
                  >
                    <span className="w-6 text-center text-sm font-semibold">
                      {MEDALS[i] ? (
                        <motion.span
                          key={`medal-${i}`}
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                          className="inline-block"
                        >
                          {MEDALS[i]}
                        </motion.span>
                      ) : (
                        <span className="text-muted-foreground">{i + 1}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{m.name}</span>
                    <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
                      <span>{t("levelsOf", { done: m.completedCount, total: TOTAL_LEVELS })}</span>
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
                              title: t("confirmRemoveTitle", { name: m.name }),
                              description: t("confirmRemoveDesc", { name: m.name }),
                              confirmLabel: t("confirmRemoveBtn"),
                              onConfirm: () => removeMutation.mutateAsync(m.userId),
                            })
                          }}
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite students dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("inviteTitle")}</DialogTitle>
            <DialogDescription>{t("inviteDesc", { name: room.name })}</DialogDescription>
          </DialogHeader>
          <div className="flex min-h-20 w-full flex-wrap content-start gap-1.5 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-within:ring-1 focus-within:ring-ring">
            {emails.map((email) => (
              <Badge key={email} variant="secondary" className="gap-1 pr-1">
                {email}
                <button
                  type="button"
                  onClick={() => removeEmail(email)}
                  aria-label={`Remove ${email}`}
                  className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <input
              value={emailInput}
              onChange={onEmailChange}
              onKeyDown={onEmailKeyDown}
              onPaste={onEmailPaste}
              onBlur={() => {
                addEmails(emailInput)
                setEmailInput("")
              }}
              placeholder={emails.length === 0 ? t("invitePlaceholder") : ""}
              className="min-w-[8rem] flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => inviteMutation.mutate()}
              disabled={(emails.length === 0 && !emailInput.trim()) || inviteMutation.isPending}
            >
              {inviteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("inviteBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("renameTitle")}</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newName.trim() && renameMutation.mutate()}
          />
          <DialogFooter>
            <Button
              onClick={() => renameMutation.mutate()}
              disabled={!newName.trim() || renameMutation.isPending}
            >
              {renameMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student drill-down */}
      <StudentDetailDialog classId={id!} member={viewing} onClose={() => setViewing(null)} />

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
  const t = useClassesT()
  const { levelTitle } = useCurriculumLabels()
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
          <DialogDescription>{t("memberProgress")}</DialogDescription>
        </DialogHeader>
        {isLoading || !data ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <span>
                {t("levelsOf", { done: data.completedLevels.length, total: TOTAL_LEVELS })}
              </span>
              <span>🏆 {t("achievementsCount", { n: data.achievementCount })}</span>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {t("completedLevels")}
              </p>
              {data.completedLevels.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t("noneYet")}</p>
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
              <p className="mb-1 text-xs font-medium text-muted-foreground">{t("quizScores")}</p>
              {data.quizScores.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t("noQuizzes")}</p>
              ) : (
                <div className="space-y-1">
                  {data.quizScores.map((q) => (
                    <div key={q.levelId} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {q.levelId} · {levelTitle(q.levelId)}
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
