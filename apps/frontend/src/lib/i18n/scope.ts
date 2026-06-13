import { useLocaleStore, type Locale } from "./index"

type Dict = Record<string, string>
type Vars = Record<string, string | number>

/**
 * Create a co-located, typed translator for a page/level. English defines the
 * keys; the other locales are type-checked to match exactly, so a missing or
 * stray translation fails the build.
 *
 *   const useT = createScope(EN, { fr: FR, nl: NL })
 *   const t = useT(); t("title")
 */
export function createScope<T extends Dict>(
  en: T,
  rest: Record<Exclude<Locale, "en">, Record<keyof T, string>>,
) {
  const dicts = { en, ...rest } as Record<Locale, Record<keyof T, string>>
  return function useScopedTranslation() {
    const locale = useLocaleStore((s) => s.locale)
    return (key: keyof T, vars?: Vars): string => {
      let str = dicts[locale][key] ?? en[key] ?? String(key)
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{${k}}`, String(v))
        }
      }
      return str
    }
  }
}
