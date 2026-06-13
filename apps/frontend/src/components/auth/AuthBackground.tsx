import { motion } from "framer-motion"

/**
 * Decorative, animated backdrop for the auth pages — a radial wash, a faint dot
 * grid, and slowly drifting colour orbs. Sits behind the card (pointer-events
 * disabled) so it never interferes with the form.
 */
export function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Radial wash from the top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.6_0.2_250_/_0.16),transparent)]" />

      {/* Dot grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04]">
        <defs>
          <pattern id="auth-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-dots)" />
      </svg>

      {/* Drifting colour orbs */}
      <motion.div
        className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, 18, 0] }}
        transition={{ repeat: Infinity, duration: 13, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl"
        animate={{ y: [0, -26, 0], x: [0, -16, 0] }}
        transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, 24, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />
    </div>
  )
}
