import { describe, expect, it } from 'vitest'

import type { GranularityI18nAdapter } from '../../i18n/adapter'
import { useGranularityTranslations } from '../granularityI18n'

function makeAdapter(dict: Record<string, string>): GranularityI18nAdapter {
  return {
    t: (key, params) => {
      const template = dict[key]
      if (template === undefined) return key
      if (!params) return template
      return template.replace(/\{([a-zA-Z0-9_.-]+)\}/g, (match, name: string) => {
        const value = params[name]
        return value == null ? match : String(value)
      })
    },
  }
}

describe('useGranularityTranslations', () => {
  it('без адаптера возвращает fallback как есть', () => {
    const { t } = useGranularityTranslations(null)
    expect(t('gr.select.addOption', 'Add value')).toBe('Add value')
  })

  it('без адаптера интерполирует {param} прямо во fallback-строке', () => {
    const { t } = useGranularityTranslations(null)
    expect(t('gr.select.addOption', 'Add "{value}"', { value: 'Wuhan' })).toBe('Add "Wuhan"')
  })

  it('пропускает плейсхолдер как есть, если параметр не передан', () => {
    const { t } = useGranularityTranslations(null)
    expect(t('gr.pagination.page', 'Page {n}')).toBe('Page {n}')
  })

  it('экранирование {{ }} даёт литеральные фигурные скобки во fallback', () => {
    const { t } = useGranularityTranslations(null)
    expect(t('missing.key', 'Use {{name}} literally')).toBe('Use {name} literally')
  })

  it('когда адаптер найден и вернул перевод — используется он, а не fallback', () => {
    const adapter = makeAdapter({ 'gr.pagination.page': 'Página {n}' })
    const { t } = useGranularityTranslations(adapter)
    expect(t('gr.pagination.page', 'Page {n}', { n: 6 })).toBe('Página 6')
  })

  it('когда адаптер не находит ключ (возвращает сам ключ) — используется интерполированный fallback', () => {
    const adapter = makeAdapter({})
    const { t } = useGranularityTranslations(adapter)
    expect(t('gr.pagination.page', 'Page {n}', { n: 6 })).toBe('Page 6')
  })
})
