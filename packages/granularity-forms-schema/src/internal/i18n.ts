import { getCurrentInstance, inject } from 'vue'

/**
 * Резолвер перевода без обязательной зависимости на `@feugene/fint-i18n`.
 *
 * Инстанс ищется по глобальному символу, который кладёт `installI18n` на
 * стороне приложения: прямой импорт сделал бы i18n обязательным рантаймом
 * пакета. Нет инстанса или ключа — показывается английский fallback, и UI не
 * ломается.
 *
 * Приём и код повторяют внутренний резолвер ядра.
 */
const FINT_I18N_KEY: symbol = Symbol.for('FintI18n')

interface I18nLike {
  t: (key: string, params?: Record<string, unknown>) => string
}

/** Подстановка `{name}` во fallback: без i18n параметры иначе остались бы в тексте. */
export function interpolateFallback(text: string, params?: Record<string, unknown>): string {
  if (!params)
    return text

  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    (key in params ? String(params[key]) : match))
}

export function useTranslations(): {
  t: (key: string, fallback: string, params?: Record<string, unknown>) => string
} {
  const i18n = getCurrentInstance() ? inject<I18nLike | null>(FINT_I18N_KEY, null) : null

  const t = (key: string, fallback: string, params?: Record<string, unknown>): string => {
    if (!i18n)
      return interpolateFallback(fallback, params)

    const result = i18n.t(key, params)
    return result === key ? interpolateFallback(fallback, params) : result
  }

  return { t }
}
