import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Thermometer, Droplets } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AHT20NodeData {
  label: string
  sclPin?: string
  sdaPin?: string
  temperature?: number
  humidity?: number
  isActive?: boolean
}

export const AHT20Node = memo(function AHT20Node({
  data,
  selected,
}: NodeProps & { data: AHT20NodeData }) {
  return (
    <div
      className={cn(
        "group relative flex min-w-[160px] flex-col items-center rounded-xl border-2 bg-gradient-to-b p-4 transition-all",
        data.isActive
          ? "border-teal-400 from-teal-200 to-teal-300 dark:from-teal-950 dark:to-teal-900 shadow-lg shadow-teal-500/20"
          : selected
            ? "border-teal-500 from-teal-100 to-teal-200 dark:from-teal-950/50 dark:to-teal-900/50 shadow-lg shadow-teal-500/10"
            : "border-teal-300 dark:border-teal-800/50 from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-900/30 hover:border-teal-400 dark:hover:border-teal-700"
      )}
    >
      {/* Glow effect when active */}
      {data.isActive && (
        <div className="absolute inset-0 -z-10 rounded-xl bg-teal-400/40 blur-xl" />
      )}

      {/* Icon */}
      <div
        className={cn(
          "mb-2 flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
          data.isActive ? "bg-teal-400/30" : "bg-teal-500/10"
        )}
      >
        <div className="relative">
          <Thermometer className={cn(
            "h-5 w-5 transition-colors",
            data.isActive ? "text-teal-300" : "text-teal-600"
          )} />
          <Droplets className={cn(
            "h-3 w-3 absolute -bottom-1 -right-1 transition-colors",
            data.isActive ? "text-cyan-300" : "text-cyan-500"
          )} />
        </div>
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          data.isActive ? "text-teal-900 dark:text-teal-100" : "text-teal-700 dark:text-teal-300/70"
        )}
      >
        {data.label}
      </span>

      {/* Sensor readings */}
      <div className="mt-1 flex items-center gap-2 text-xs">
        {data.temperature !== undefined && (
          <span className="font-mono text-teal-600/70 dark:text-teal-500/70">
            {data.temperature}°C
          </span>
        )}
        {data.humidity !== undefined && (
          <span className="font-mono text-cyan-600/70 dark:text-cyan-500/70">
            {data.humidity}%
          </span>
        )}
      </div>

      {/* Pin info */}
      <div className="mt-1 flex flex-col items-center gap-0.5">
        <span className="font-mono text-[10px] text-teal-600/70 dark:text-teal-500/70">
          I2C: {data.sclPin || "GPIO0"}/{data.sdaPin || "GPIO1"}
        </span>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-teal-400 !bg-teal-500"
      />

      {/* Category badge */}
      <div
        className={cn(
          "absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase text-white transition-colors",
          data.isActive ? "bg-teal-500" : "bg-teal-700"
        )}
      >
        Sensor
      </div>
    </div>
  )
})
