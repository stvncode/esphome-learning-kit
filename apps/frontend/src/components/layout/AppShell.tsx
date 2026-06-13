import { getProgress } from "@/lib/api"
import { useProgressStore } from "@/stores/progressStore"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"

export function AppShell() {
  const hydrate = useProgressStore((s) => s.hydrate)
  const loaded = useProgressStore((s) => s.loaded)

  const { data } = useQuery({ queryKey: ["progress"], queryFn: getProgress })

  useEffect(() => {
    if (data) hydrate(data)
  }, [data, hydrate])

  if (!loaded) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="min-h-[calc(100svh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
