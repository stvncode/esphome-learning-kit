import { create } from "zustand"
import { persist } from "zustand/middleware"
import en from "./en.json"
import fr from "./fr.json"
import nl from "./nl.json"

export const LOCALES = ["en", "fr", "nl"] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  nl: "Nederlands",
}

/**
 * All UI copy lives in one JSON file per locale (`en.json` is the source of
 * truth). English defines the shape; `fr`/`nl` are structurally type-checked
 * against it here, so a missing key fails the build.
 */
type Messages = typeof en
const DICTIONARIES: Record<Locale, Messages> = { en, fr, nl }

/** Dotted leaf paths of a nested message tree, e.g. `"nav.dashboard"`. */
type LeafKeys<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${LeafKeys<T[K]>}`
}[keyof T & string]

/** Top-level feature namespaces inside the dictionaries (`common`, `workspace`, …). */
export type Namespace = keyof Messages

/** Translation keys for the shared/global namespace, used by `useTranslation`. */
export type TranslationKey = LeafKeys<Messages["common"]>

type Vars = Record<string, string | number>

function resolve(tree: unknown, key: string): string | undefined {
  let cur: unknown = tree
  for (const part of key.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined
    cur = (cur as Record<string, unknown>)[part]
  }
  return typeof cur === "string" ? cur : undefined
}

function interpolate(str: string, vars?: Vars): string {
  if (!vars) return str
  let out = str
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, String(v))
  }
  return out
}

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

/** Current UI language. Persisted as a device preference (like the theme). */
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "esphome-locale" },
  ),
)

/**
 * Build a typed translator scoped to one feature namespace. Keys are relative
 * to that namespace (`useWorkspaceT()("home.title")`), English is the fallback,
 * and `{var}` placeholders are interpolated.
 */
function createScope<NS extends Namespace>(ns: NS) {
  return function useScopedTranslation() {
    const locale = useLocaleStore((s) => s.locale)
    return (key: LeafKeys<Messages[NS]>, vars?: Vars): string => {
      const str = resolve(DICTIONARIES[locale][ns], key) ?? resolve(en[ns], key) ?? key
      return interpolate(str, vars)
    }
  }
}

export const useHomeT = createScope("home")
export const useLandingT = createScope("landing")
export const useWorkspaceT = createScope("workspace")
export const useGlossaryT = createScope("glossary")
export const useClassesT = createScope("classes")
export const useCurriculumT = createScope("curriculum")

type LevelId = keyof Messages["levels"]

/**
 * Typed translator for a single lesson level:
 * `const t = useLevelT("1_1"); t("header.title")`. Keys are relative to that
 * level's subtree under the `levels` namespace, with English fallback.
 */
export function useLevelT<K extends LevelId>(level: K) {
  const locale = useLocaleStore((s) => s.locale)
  return (key: LeafKeys<Messages["levels"][K]>, vars?: Vars): string => {
    const str =
      resolve(DICTIONARIES[locale].levels[level], key) ?? resolve(en.levels[level], key) ?? key
    return interpolate(str, vars)
  }
}

/** Typed translation hook for shared copy: `t("settings.title")`. */
export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const t = (key: TranslationKey, vars?: Vars): string => {
    const str = resolve(DICTIONARIES[locale].common, key) ?? resolve(en.common, key) ?? key
    return interpolate(str, vars)
  }
  return { t, locale, setLocale }
}

type CurriculumKey = LeafKeys<Messages["curriculum"]>

/** Convenience hooks for the dynamic phase/level keys. */
export function useCurriculumLabels() {
  const t = useCurriculumT()
  return {
    levelTitle: (id: string) => t(`level.${id}` as CurriculumKey),
    phaseTitle: (n: number) => t(`phase.${n}` as CurriculumKey),
    phaseDesc: (n: number) => t(`phaseDesc.${n}` as CurriculumKey),
    phaseLabel: (n: number) => t("breadcrumb.phase", { n }),
  }
}
