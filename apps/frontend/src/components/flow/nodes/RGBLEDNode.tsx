import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RGBLEDNodeData {
  label: string
  pin?: string
  ledCount?: number
  isOn?: boolean
  color?: { r: number; g: number; b: number }
  brightness?: number
  effect?: string
}

export const RGBLEDNode = memo(function RGBLEDNode({
  data,
  selected,
}: NodeProps & { data: RGBLEDNodeData }) {
  const color = data.color || { r: 255, g: 100, b: 50 }
  const brightness = data.brightness ?? 100
  const ledCount = data.ledCount || 8

  // Generate LED strip visualization
  const leds = Array.from({ length: Math.min(ledCount, 8) }, (_, i) => {
    const hueShift = (i / ledCount) * 30 // Slight variation for visual interest
    return {
      r: Math.min(255, color.r + hueShift),
      g: Math.min(255, color.g),
      b: Math.min(255, color.b),
    }
  })

  return (
    <div
      className={cn(
        "group relative flex min-w-[160px] flex-col items-center rounded-xl border-2 bg-gradient-to-b p-4 transition-all",
        data.isOn
          ? "border-pink-400 from-pink-200 to-pink-300 dark:from-pink-950 dark:to-pink-900 shadow-lg shadow-pink-500/20"
          : selected
            ? "border-pink-500 from-pink-100 to-pink-200 dark:from-pink-950/50 dark:to-pink-900/50 shadow-lg shadow-pink-500/10"
            : "border-pink-300 dark:border-pink-800/50 from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/30 hover:border-pink-400 dark:hover:border-pink-700"
      )}
    >
      {/* Glow effect when on */}
      {data.isOn && (
        <div 
          className="absolute inset-0 -z-10 rounded-xl blur-xl transition-colors"
          style={{
            backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`
          }}
        />
      )}

      {/* Icon */}
      <div
        className={cn(
          "mb-2 flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
          data.isOn ? "bg-pink-400/30" : "bg-pink-500/10"
        )}
      >
        <Sparkles
          className={cn(
            "h-6 w-6 transition-colors",
            data.isOn ? "text-pink-300 animate-pulse" : "text-pink-600"
          )}
        />
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          data.isOn ? "text-pink-900 dark:text-pink-100" : "text-pink-700 dark:text-pink-300/70"
        )}
      >
        {data.label}
      </span>

      {/* LED Strip Visualization */}
      <div className="mt-2 flex gap-0.5">
        {leds.map((led, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              data.isOn ? "animate-pulse" : "opacity-30"
            )}
            style={{
              backgroundColor: data.isOn 
                ? `rgb(${led.r}, ${led.g}, ${led.b})`
                : "rgb(100, 100, 100)",
              boxShadow: data.isOn 
                ? `0 0 6px rgba(${led.r}, ${led.g}, ${led.b}, 0.8)`
                : "none",
              animationDelay: `${i * 100}ms`
            }}
          />
        ))}
      </div>

      {/* Brightness & Effect */}
      <div className="mt-1 flex items-center gap-2 text-xs">
        {data.isOn && (
          <span className="font-mono text-pink-600/70 dark:text-pink-500/70">
            {brightness}%
          </span>
        )}
        {data.effect && data.isOn && (
          <span className="text-pink-500/70">
            {data.effect}
          </span>
        )}
      </div>

      {/* Pin info */}
      <div className="mt-1 flex items-center gap-1">
        <span className="font-mono text-xs text-pink-600/70 dark:text-pink-400/70">
          {data.pin || "GPIO7"}
        </span>
        <span className="text-[10px] text-pink-600/50 dark:text-pink-500/50">
          ({ledCount} LEDs)
        </span>
      </div>

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-pink-400 !bg-pink-500"
      />

      {/* Category badge */}
      <div
        className={cn(
          "absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase text-white transition-colors",
          data.isOn ? "bg-pink-500" : "bg-pink-700"
        )}
      >
        Output
      </div>
    </div>
  )
})
