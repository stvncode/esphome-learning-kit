import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppShell } from "@/components/layout"
import { Loader2 } from "lucide-react"
import { lazy, Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

// Public pages — small, but split so the initial chunk stays lean.
const Landing = lazy(() => import("@/pages/Landing").then((m) => ({ default: m.Landing })))
const SignIn = lazy(() => import("@/pages/SignIn").then((m) => ({ default: m.SignIn })))
const SignUp = lazy(() => import("@/pages/SignUp").then((m) => ({ default: m.SignUp })))
const ForgotPassword = lazy(() =>
  import("@/pages/ForgotPassword").then((m) => ({ default: m.ForgotPassword })),
)
const ResetPassword = lazy(() =>
  import("@/pages/ResetPassword").then((m) => ({ default: m.ResetPassword })),
)
const NotFound = lazy(() => import("@/pages/NotFound").then((m) => ({ default: m.NotFound })))

// App pages — the heavy ones (flow canvas, YAML, animations).
const Home = lazy(() => import("@/pages/Home").then((m) => ({ default: m.Home })))
const Level = lazy(() => import("@/pages/Level").then((m) => ({ default: m.Level })))
const WorkspaceHome = lazy(() =>
  import("@/pages/WorkspaceHome").then((m) => ({ default: m.WorkspaceHome })),
)
const Workspace = lazy(() => import("@/pages/Workspace").then((m) => ({ default: m.Workspace })))
const Classes = lazy(() => import("@/pages/Classes").then((m) => ({ default: m.Classes })))
const Classroom = lazy(() => import("@/pages/Classroom").then((m) => ({ default: m.Classroom })))
const Certificate = lazy(() => import("@/pages/Certificate").then((m) => ({ default: m.Certificate })))
const Glossary = lazy(() => import("@/pages/Glossary").then((m) => ({ default: m.Glossary })))

function PageFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public routes — no AppShell */}
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* App routes — authenticated, with sidebar + header */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/app" element={<Home />} />
              <Route path="/app/level/:levelId" element={<Level />} />
              <Route path="/app/workspace" element={<WorkspaceHome />} />
              <Route path="/app/workspace/builder" element={<Workspace />} />
              <Route path="/app/classes" element={<Classes />} />
              <Route path="/app/classes/:id" element={<Classroom />} />
              <Route path="/app/glossary" element={<Glossary />} />
            </Route>
            {/* Full-screen (no shell) so it prints cleanly */}
            <Route path="/app/certificate" element={<Certificate />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
