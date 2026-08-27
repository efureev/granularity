import type { PluginSetupFunction } from '@vue/devtools-kit'
import type { App } from 'vue'
import { GRANULARITY_I18N_KEY } from '@feugene/granularity/i18n'

import type { GrIssueLog } from '../resolve/issues'

type DevtoolsApi = Parameters<PluginSetupFunction>[0]

/** Ключ `@feugene/fint-i18n`: ядро принимает адаптер и под ним тоже. */
const FINT_I18N_KEY: symbol = Symbol.for('FintI18n')

interface AdapterLike {
  t?: unknown
  locale?: unknown
}

function readAdapter(app: App): { key: string, adapter: AdapterLike } | null {
  const provides = (app._context?.provides ?? {}) as Record<symbol, AdapterLike | undefined>

  for (const [label, key] of [['granularity', GRANULARITY_I18N_KEY as symbol], ['fint-i18n', FINT_I18N_KEY]] as const) {
    const candidate = provides[key]
    if (typeof candidate?.t === 'function')
      return { key: label, adapter: candidate }
  }

  return null
}

function readLocale(adapter: AdapterLike): string | null {
  const locale = adapter.locale
  if (typeof locale === 'string')
    return locale
  // У реактивного адаптера локаль приезжает рефом.
  if (locale && typeof locale === 'object' && 'value' in locale && typeof locale.value === 'string')
    return locale.value
  return null
}

/**
 * Состояние i18n приложения.
 *
 * Ядро ищет адаптер по цепочке «явный контекст → свой ключ → ключ fint-i18n →
 * inject → null» и при `null` **молча** падает на встроенные английские строки.
 * Панель проговаривает это вслух — молчание тут и есть дефект.
 *
 * Чего раздел **не** делает: не считает промахи ключей. Для этого пришлось бы
 * обернуть `t` у чужого адаптера, то есть писать в состояние приложения, — это
 * отдельное решение, см. открытые вопросы ТЗ.
 */
export function registerI18nState(api: DevtoolsApi, app: App, log: GrIssueLog): void {
  const found = readAdapter(app)

  if (!found) {
    log.record(
      'warning',
      null,
      'i18n adapter not found: components fall back to their built-in English strings',
    )
    return
  }

  const locale = readLocale(found.adapter)
  api.addTimelineEvent({
    layerId: 'granularity:announcer',
    event: {
      time: api.now(),
      data: { adapter: found.key, locale },
      title: `i18n adapter: ${found.key}`,
      subtitle: locale ? `locale: ${locale}` : 'locale is not exposed by the adapter',
    },
  })
}
