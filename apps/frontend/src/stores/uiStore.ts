import { create } from "zustand"

interface UIState {
  commandOpen: boolean
  setCommandOpen: (open: boolean) => void
  toggleCommand: () => void
}

/** Transient UI state (e.g. the command palette). Not persisted. */
export const useUIStore = create<UIState>((set) => ({
  commandOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  toggleCommand: () => set((s) => ({ commandOpen: !s.commandOpen })),
}))
