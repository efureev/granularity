import { getCurrentInstance, inject, type AppContext } from 'vue'

import { GRANULARITY_I18N_KEY, type GranularityI18nAdapter } from '../i18n/adapter'

export type GranularityI18nLike = GranularityI18nAdapter

/**
 * Ключ provide/inject из `@feugene/fint-i18n` (`Symbol.for("FintI18n")`).
 *
 * Дублируем константу здесь, чтобы не делать `@feugene/fint-i18n` обязательной
 * runtime-зависимостью пакета: достаточно, чтобы приложение само установило
 * fint-i18n через `installI18n(app, i18n)` — символ глобальный (Symbol.for),
 * поэтому ключи будут совпадать без прямого импорта.
 */
const FINT_I18N_KEY: symbol = Symbol.for('FintI18n')

function isGranularityI18nLike(value: unknown): value is GranularityI18nLike {
  return typeof (value as GranularityI18nLike | null)?.t === 'function'
}

export function resolveGranularityI18n(context?: AppContext | GranularityI18nLike | null): GranularityI18nLike | null {
  if (isGranularityI18nLike(context)) {
    return context
  }

  const provides = context?.provides

  if (provides) {
    const fromGranularity = provides[GRANULARITY_I18N_KEY as symbol] as GranularityI18nLike | null | undefined
    if (isGranularityI18nLike(fromGranularity)) {
      return fromGranularity
    }

    const fromFint = provides[FINT_I18N_KEY] as GranularityI18nLike | null | undefined
    if (isGranularityI18nLike(fromFint)) {
      return fromFint
    }

    return null
  }

  if (!getCurrentInstance()) {
    return null
  }

  const fromGranularity = inject<GranularityI18nLike | null>(GRANULARITY_I18N_KEY, null)
  if (isGranularityI18nLike(fromGranularity)) {
    return fromGranularity
  }

  const fromFint = inject<GranularityI18nLike | null>(FINT_I18N_KEY, null)
  if (isGranularityI18nLike(fromFint)) {
    return fromFint
  }

  return null
}

export function useGranularityTranslations(context?: AppContext | GranularityI18nLike | null) {
  const i18n = resolveGranularityI18n(context)

  const t = (key: string, fallback: string, params?: Record<string, any>): string => {
    if (!i18n) {
      return fallback
    }

    const result = i18n.t(key, params)
    return result === key ? fallback : result
  }

  return {
    i18n,
    t,
  }
}