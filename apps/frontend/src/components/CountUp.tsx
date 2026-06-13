import { animate, motion, useMotionValue, useTransform } from "framer-motion"
import { useEffect } from "react"

interface CountUpProps {
  value: number
  suffix?: string
  duration?: number
}

/** Animates a number from 0 up to `value` on mount / when the value changes. */
export function CountUp({ value, suffix = "", duration = 0.9 }: CountUpProps) {
  const count = useMotionValue(0)
  const text = useTransform(count, (v) => `${Math.round(v)}${suffix}`)

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" })
    return controls.stop
  }, [count, value, duration])

  return <motion.span>{text}</motion.span>
}
