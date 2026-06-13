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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createClassroom, listClassrooms } from "@/lib/api"
import { useRole } from "@/lib/auth-client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GraduationCap, Loader2, Plus, Users } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useClassesT } from "./classes.i18n"

export function Classes() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const role = useRole()
  const isTeacher = role === "teacher"
  const t = useClassesT()
  const [createOpen, setCreateOpen] = useState(false)
  const [className, setClassName] = useState("")

  const { data: classes, isLoading } = useQuery({ queryKey: ["classrooms"], queryFn: listClassrooms })

  const memberCount = (n: number) => t(n === 1 ? "student" : "students", { n })

  const createMutation = useMutation({
    mutationFn: () => createClassroom(className.trim()),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] })
      setCreateOpen(false)
      setClassName("")
      toast.success(t("toastCreated", { name: room.name }))
      navigate(`/app/classes/${room.id}`)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-cyan-400" />
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {isTeacher ? t("subtitleTeacher") : t("subtitleStudent")}
          </p>
        </div>
        {isTeacher && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("create")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("create")}</DialogTitle>
                <DialogDescription>{t("createDesc")}</DialogDescription>
              </DialogHeader>
              <Input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder={t("createPlaceholder")}
                onKeyDown={(e) => e.key === "Enter" && className.trim() && createMutation.mutate()}
              />
              <DialogFooter>
                <Button onClick={() => createMutation.mutate()} disabled={!className.trim() || createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("createBtn")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !classes?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {isTeacher ? t("emptyTeacher") : t("emptyStudent")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {classes.map((room) => (
            <button key={room.id} onClick={() => navigate(`/app/classes/${room.id}`)} className="text-left">
              <Card className="h-full cursor-pointer border-border/50 transition-all hover:border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{room.name}</CardTitle>
                    <Badge variant={room.role === "teacher" ? "default" : "secondary"}>
                      {room.role === "teacher" ? t("roleTeacher") : t("roleStudent")}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {memberCount(room.memberCount)}
                    </span>
                    {room.role === "teacher" && (
                      <span className="font-mono tracking-widest text-foreground/70">{room.code}</span>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
