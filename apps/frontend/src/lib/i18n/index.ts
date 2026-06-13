import { create } from "zustand"
import { persist } from "zustand/middleware"
import { en, type TranslationKey } from "./en"
import { fr } from "./fr"
import { nl } from "./nl"

export type { TranslationKey } from "./en"

export const LOCALES = ["en", "fr", "nl"] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  nl: "Nederlands",
}

const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = { en, fr, nl }

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

type Vars = Record<string, string | number>

function translate(locale: Locale, key: TranslationKey, vars?: Vars): string {
  let str = DICTIONARIES[locale][key] ?? en[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, String(v))
    }
  }
  return str
}

/** Typed translation hook: `t("settings.title")`, with `{var}` interpolation. */
export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const t = (key: TranslationKey, vars?: Vars) => translate(locale, key, vars)
  return { t, locale, setLocale }
}
