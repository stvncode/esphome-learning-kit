import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BuzzerNodeData {
  label: string
  pin?: string
  isOn?: boolean
  frequency?: number
  duration?: string
}

export const BuzzerNode = memo(function BuzzerNode({
  data,
  selected,
}: NodeProps & { data: BuzzerNodeData }) {
  return (
    <div
      className={cn(
        "group relative flex min-w-[140px] flex-col items-center rounded-xl border-2 bg-gradient-to-b p-4 transition-all",
        data.isOn
          ? "border-rose-400 from-rose-200 to-rose-300 dark:from-rose-950 dark:to-rose-900 shadow-lg shadow-rose-500/20"
          : selected
            ? "border-rose-500 from-rose-100 to-rose-200 dark:from-rose-950/50 dark:to-rose-900/50 shadow-lg shadow-rose-500/10"
            : "border-rose-300 dark:border-rose-800/50 from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/30 hover:border-rose-400 dark:hover:border-rose-700"
      )}
    >
      {/* Glow effect when on */}
      {data.isOn && (
        <div className="absolute inset-0 -z-10 rounded-xl bg-rose-400/40 blur-xl" />
      )}

      {/* Sound wave animation */}
      {data.isOn && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl">
          <div className="absolute h-8 w-8 animate-ping rounded-full bg-rose-400/20" />
          <div className="absolute h-12 w-12 animate-ping rounded-full bg-rose-400/10" style={{ animationDelay: "150ms" }} />
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "mb-2 flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
          data.isOn ? "bg-rose-400/30" : "bg-rose-500/10"
        )}
      >
        {data.isOn ? (
          <Volume2 className="h-6 w-6 text-rose-300 animate-pulse" />
        ) : (
          <VolumeX className="h-6 w-6 text-rose-600" />
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          data.isOn ? "text-rose-900 dark:text-rose-100" : "text-rose-700 dark:text-rose-300/70"
        )}
      >
        {data.label}
      </span>

      {/* Frequency info */}
      {data.frequency && data.isOn && (
        <span className="mt-1 font-mono text-xs text-rose-500">
          {data.frequency}Hz
        </span>
      )}

      {/* Duration */}
      {data.duration && (
        <span className="mt-0.5 text-xs text-rose-600/70 dark:text-rose-500/70">
          {data.duration}
        </span>
      )}

      {/* Pin info */}
      {data.pin && (
        <span className="mt-1 font-mono text-xs text-rose-600/70 dark:text-rose-400/70">
          {data.pin}
        </span>
      )}

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-rose-400 !bg-rose-500"
      />

      {/* Category badge */}
      <div
        className={cn(
          "absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase text-white transition-colors",
          data.isOn ? "bg-rose-500" : "bg-rose-700"
        )}
      >
        Output
      </div>
    </div>
  )
})
