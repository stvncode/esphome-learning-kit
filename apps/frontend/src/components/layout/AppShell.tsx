import { CommandPalette } from "@/components/CommandPalette"
import { OnboardingDialog } from "@/components/OnboardingDialog"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getProgress } from "@/lib/api"
import { useProgressStore } from "@/stores/progressStore"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { AppSidebar } from "./AppSidebar"
import { Header } from "./Header"

export function AppShell() {
  const hydrate = useProgressStore((s) => s.hydrate)
  const loaded = useProgressStore((s) => s.loaded)

  const { data, isError, refetch, isFetching } = useQuery({
    queryKey: ["progress"],
    queryFn: getProgress,
  })

  useEffect(() => {
    if (data) hydrate(data)
  }, [data, hydrate])

  if (!loaded && isError) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background text-center">
        <p className="text-sm text-muted-foreground">Couldn't load your progress.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
          Try again
        </Button>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <CommandPalette />
      <OnboardingDialog />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
