import { useSession } from "@/lib/auth-client"
import { Loader2 } from "lucide-react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

/**
 * Gates the /app/* routes. While the session is loading we show a spinner;
 * an unauthenticated visitor is bounced to /signin (remembering where they
 * were headed so we can return them after login).
 */
export function ProtectedRoute() {
  const { data: session, isPending } = useSession()
  const location = useLocation()

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/signin" replace state={{ from: location }} />
  }

  return <Outlet />
}
