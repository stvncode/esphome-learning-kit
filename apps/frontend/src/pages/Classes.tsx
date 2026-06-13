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
import { createClassroom, joinClassroom, listClassrooms } from "@/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GraduationCap, Loader2, Plus, Users } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function Classes() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [className, setClassName] = useState("")
  const [code, setCode] = useState("")

  const { data: classes, isLoading } = useQuery({ queryKey: ["classrooms"], queryFn: listClassrooms })

  const createMutation = useMutation({
    mutationFn: () => createClassroom(className.trim()),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] })
      setCreateOpen(false)
      setClassName("")
      toast.success(`Class "${room.name}" created`)
      navigate(`/app/classes/${room.id}`)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const joinMutation = useMutation({
    mutationFn: () => joinClassroom(code.trim().toUpperCase()),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] })
      setJoinOpen(false)
      setCode("")
      toast.success(`Joined "${room.name}"`)
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
            <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Teach a class or join one with a code to track progress together.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Join a class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a class</DialogTitle>
                <DialogDescription>Enter the code your teacher gave you.</DialogDescription>
              </DialogHeader>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="font-mono tracking-widest"
                onKeyDown={(e) => e.key === "Enter" && code.trim() && joinMutation.mutate()}
              />
              <DialogFooter>
                <Button onClick={() => joinMutation.mutate()} disabled={!code.trim() || joinMutation.isPending}>
                  {joinMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Join
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create a class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a class</DialogTitle>
                <DialogDescription>
                  You'll be the teacher. Students join with the code we generate.
                </DialogDescription>
              </DialogHeader>
              <Input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Period 3 — Intro to IoT"
                onKeyDown={(e) => e.key === "Enter" && className.trim() && createMutation.mutate()}
              />
              <DialogFooter>
                <Button onClick={() => createMutation.mutate()} disabled={!className.trim() || createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
              You're not in any classes yet. Create one or join with a code.
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
                    <Badge variant={room.role === "teacher" ? "default" : "secondary"} className="capitalize">
                      {room.role}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {room.memberCount} student{room.memberCount !== 1 ? "s" : ""}
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
