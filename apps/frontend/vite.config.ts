import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split large, stable vendors into their own long-cached chunks.
        manualChunks(id) {
          if (!id.includes("node_modules")) return
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router/") ||
            id.includes("/react-router-dom/") ||
            id.includes("/scheduler/")
          )
            return "react-vendor"
          if (
            id.includes("/framer-motion/") ||
            id.includes("/motion-dom/") ||
            id.includes("/motion-utils/")
          )
            return "motion"
          if (id.includes("@monaco-editor")) return "editor"
          if (id.includes("better-auth")) return "auth"
          if (id.includes("/zod/")) return "validation"
        },
      },
    },
  },
})
