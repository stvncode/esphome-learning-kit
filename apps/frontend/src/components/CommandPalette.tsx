import { LEVEL_ORDER } from "@/lib/curriculum"
import { useTranslation } from "@/lib/i18n"
import { useCurriculumLabels } from "@/lib/i18n/curriculum.i18n"
import { useUIStore } from "@/stores/uiStore"
import { AnimatePresence, motion } from "framer-motion"
import {
  Award,
  BookOpen,
  GraduationCap,
  Home,
  Layers,
  Search,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { TranslationKey } from "@/lib/i18n"

interface CommandItem {
  id: string
  label: string
  hint?: string
  to: string
  icon: LucideIcon
  keywords: string
}

const NAV_META: { id: string; to: string; icon: LucideIcon; labelKey: TranslationKey; keywords: string }[] = [
  { id: "dashboard", to: "/app", icon: Home, labelKey: "nav.dashboard", keywords: "home dashboard progress accueil" },
  { id: "workspace", to: "/app/workspace", icon: Wrench, labelKey: "nav.workspace", keywords: "builder yaml workspace atelier werkruimte" },
  { id: "classes", to: "/app/classes", icon: GraduationCap, labelKey: "nav.classes", keywords: "class classroom students teacher classe klas" },
  { id: "glossary", to: "/app/glossary", icon: BookOpen, labelKey: "nav.glossary", keywords: "glossary terms help glossaire woordenlijst" },
  { id: "settings", to: "/app/settings", icon: Wrench, labelKey: "nav.settings", keywords: "settings preferences paramètres instellingen" },
  { id: "certificate", to: "/app/certificate", icon: Award, labelKey: "palette.certificate", keywords: "certificate graduate certificat certificaat" },
]

export function CommandPalette() {
  const open = useUIStore((s) => s.commandOpen)
  const setOpen = useUIStore((s) => s.setCommandOpen)
  const toggle = useUIStore((s) => s.toggleCommand)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { levelTitle, phaseLabel } = useCurriculumLabels()
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Global ⌘K / Ctrl+K toggle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggle])

  // Reset + focus when opened.
  useEffect(() => {
    if (open) {
      setQuery("")
      setActive(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const allItems = useMemo<CommandItem[]>(() => {
    const nav: CommandItem[] = NAV_META.map((m) => ({
      id: m.id,
      label: t(m.labelKey),
      to: m.to,
      icon: m.icon,
      keywords: `${t(m.labelKey).toLowerCase()} ${m.keywords}`,
    }))
    const levels: CommandItem[] = LEVEL_ORDER.map((l) => ({
      id: `level-${l.id}`,
      label: `${l.id} · ${levelTitle(l.id)}`,
      hint: phaseLabel(l.phase),
      to: `/app/level/${l.id}`,
      icon: Layers,
      keywords: `level ${l.id} ${levelTitle(l.id).toLowerCase()}`,
    }))
    return [...nav, ...levels]
  }, [t, levelTitle, phaseLabel])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allItems
    return allItems.filter(
      (i) => i.label.toLowerCase().includes(q) || i.keywords.includes(q),
    )
  }, [query, allItems])

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(results.length - 1, 0)))
  }, [results.length])

  const select = (item: CommandItem | undefined) => {
    if (!item) return
    setOpen(false)
    navigate(item.to)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      select(results[active])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  // Keep the active row in view.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [active])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t("palette.placeholder")}
                className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">{t("palette.noResults")}</p>
              ) : (
                results.map((item, i) => {
                  const Icon = item.icon
                  const isActive = i === active
                  return (
                    <button
                      key={item.id}
                      data-idx={i}
                      onClick={() => select(item)}
                      onMouseMove={() => setActive(i)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        isActive ? "bg-accent text-accent-foreground" : "text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.hint && (
                        <span className="shrink-0 text-xs text-muted-foreground">{item.hint}</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
