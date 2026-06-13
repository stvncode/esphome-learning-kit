import { Button } from "@/components/ui/button"
import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/** Catches render-time errors anywhere below it and shows a recoverable fallback. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-6 text-center">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              An unexpected error occurred. Reloading usually fixes it.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => this.setState({ error: null })}>
              Try again
            </Button>
            <Button onClick={() => window.location.reload()}>Reload page</Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
