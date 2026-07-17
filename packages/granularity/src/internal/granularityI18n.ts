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

// Совпадает с синтаксисом плейсхолдеров `@feugene/fint-i18n` (`{name}`, экранирование
// `{{`/`}}` — см. docs/en/api.md → "Template Interpolation"), чтобы fallback-текст вёл
// себя идентично реальному переводу, когда параметры переданы.
const FALLBACK_PLACEHOLDER_RE = /\{\{|\}\}|\{([a-zA-Z0-9_.-]+)\}/g

/**
 * Интерполирует `{name}`-плейсхолдеры во fallback-строке. Нужен, чтобы `t(key, fallback,
 * params)` корректно подставлял параметры и тогда, когда i18n не подключён (или ключ не
 * найден) — иначе вызывающий код получил бы сырой `'Add "{value}"'` вместо `'Add "foo"'`.
 */
function interpolateFallback(template: string, params?: Record<string, any>): string {
  // `{{`/`}}`-экранирование обязано работать независимо от того, переданы ли `params`
  // (совпадает с fint-i18n: `t('literal')` без параметров тоже разэкранирует `{{name}}`).
  // Ранний выход по `!params` здесь недопустим.
  return template.replace(FALLBACK_PLACEHOLDER_RE, (match, name: string | undefined) => {
    if (match === '{{') return '{'
    if (match === '}}') return '}'
    if (name === undefined) return match

    const value = params?.[name]
    return value == null ? match : String(value)
  })
}

export function useGranularityTranslations(context?: AppContext | GranularityI18nLike | null) {
  const i18n = resolveGranularityI18n(context)

  const t = (key: string, fallback: string, params?: Record<string, any>): string => {
    if (!i18n) {
      return interpolateFallback(fallback, params)
    }

    const result = i18n.t(key, params)
    return result === key ? interpolateFallback(fallback, params) : result
  }

  return {
    i18n,
    t,
  }
}