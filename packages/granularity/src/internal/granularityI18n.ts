import { getCurrentInstance, inject, type AppContext } from 'vue'

import { GRANULARITY_I18N_KEY, type GranularityI18nAdapter } from '../i18n/adapter'

export type GranularityI18nLike = GranularityI18nAdapter

function isGranularityI18nLike(value: unknown): value is GranularityI18nLike {
  return typeof (value as GranularityI18nLike | null)?.t === 'function'
}

export function resolveGranularityI18n(context?: AppContext | GranularityI18nLike | null): GranularityI18nLike | null {
  if (isGranularityI18nLike(context)) {
    return context
  }

  const provides = context?.provides

  if (provides) {
    return provides[GRANULARITY_I18N_KEY as symbol] as GranularityI18nLike | null
  }

  return getCurrentInstance() ? inject(GRANULARITY_I18N_KEY, null) : null
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