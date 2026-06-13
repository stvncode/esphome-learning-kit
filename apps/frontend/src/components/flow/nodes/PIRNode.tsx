import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PIRNodeData {
  label: string
  pin?: string
  isActive?: boolean
  motionDetected?: boolean
}

export const PIRNode = memo(function PIRNode({
  data,
  selected,
}: NodeProps & { data: PIRNodeData }) {
  const isTriggered = data.isActive || data.motionDetected

  return (
    <div
      className={cn(
        "group relative flex min-w-[140px] flex-col items-center rounded-xl border-2 bg-gradient-to-b p-4 transition-all",
        isTriggered
          ? "border-purple-400 from-purple-200 to-purple-300 dark:from-purple-950 dark:to-purple-900 shadow-lg shadow-purple-500/20"
          : selected
            ? "border-purple-500 from-purple-100 to-purple-200 dark:from-purple-950/50 dark:to-purple-900/50 shadow-lg shadow-purple-500/10"
            : "border-purple-300 dark:border-purple-800/50 from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 hover:border-purple-400 dark:hover:border-purple-700"
      )}
    >
      {/* Glow effect when motion detected */}
      {isTriggered && (
        <div className="absolute inset-0 -z-10 rounded-xl bg-purple-400/40 blur-xl" />
      )}

      {/* Radar pulse animation when active */}
      {isTriggered && (
        <div className="absolute inset-0 rounded-xl">
          <div className="absolute inset-0 animate-ping rounded-xl bg-purple-400/20" />
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "mb-2 flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
          isTriggered ? "bg-purple-400/30" : "bg-purple-500/10"
        )}
      >
        <Activity
          className={cn(
            "h-6 w-6 transition-colors",
            isTriggered ? "text-purple-300 animate-pulse" : "text-purple-600"
          )}
        />
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          isTriggered ? "text-purple-900 dark:text-purple-100" : "text-purple-700 dark:text-purple-300/70"
        )}
      >
        {data.label}
      </span>

      {/* Status */}
      <span className={cn(
        "mt-1 text-xs font-medium transition-colors",
        isTriggered ? "text-purple-500" : "text-purple-600/50 dark:text-purple-500/50"
      )}>
        {isTriggered ? "Motion!" : "Idle"}
      </span>

      {/* Pin info */}
      {data.pin && (
        <span className="mt-0.5 font-mono text-xs text-purple-600/70 dark:text-purple-400/70">
          {data.pin}
        </span>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-purple-400 !bg-purple-500"
      />

      {/* Category badge */}
      <div
        className={cn(
          "absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase text-white transition-colors",
          isTriggered ? "bg-purple-500" : "bg-purple-700"
        )}
      >
        Input
      </div>
    </div>
  )
})
