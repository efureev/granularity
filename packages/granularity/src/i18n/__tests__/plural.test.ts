import { describe, expect, it, vi } from 'vitest'

import { useGranularityTranslations } from '../../internal/granularityI18n'

/**
 * Множественное число — целиком на стороне переводчика.
 *
 * Пакет его не реализует: формы живут в словаре (`one:… | few:… | many:…`,
 * синтаксис `@feugene/fint-i18n` и `vue-i18n`), а компонент лишь передаёт число.
 * Своей копии `Intl.PluralRules` здесь нет намеренно — вторая реализация в
 * UI-библиотеке однажды разошлась бы с приложением в правилах.
 *
 * Проверяем ровно свою половину контракта: число доходит до переводчика, а без
 * него показывается встроенный fallback — одной формой и как есть.
 */
describe('число передаётся переводчику', () => {
  it('уходит под обоими общепринятыми именами', () => {
    // `n` читают fint-i18n и vue-i18n, `count` — i18next.
    const t = vi.fn((key: string) => key)
    const { t: translate } = useGranularityTranslations({ t })

    translate('gr.autocomplete.typeMore', 'Type at least {n} characters', { n: 3, count: 3 })

    expect(t).toHaveBeenCalledWith('gr.autocomplete.typeMore', { n: 3, count: 3 })
  })

  it('перевод переводчика важнее встроенного текста', () => {
    const { t } = useGranularityTranslations({
      t: (_key, params) => `Введите минимум ${String(params?.n)} символа`,
    })

    expect(t('k', 'Type at least {n} characters', { n: 3 })).toBe('Введите минимум 3 символа')
  })

  it('без переводчика показывается fallback с подставленным числом', () => {
    const { t } = useGranularityTranslations(null)

    expect(t('k', 'Type at least {n} characters', { n: 3 })).toBe('Type at least 3 characters')
  })

  it('вертикальная черта в тексте остаётся текстом', () => {
    // Формы разбирает переводчик; пакет не трогает `|` вовсе.
    const { t } = useGranularityTranslations(null)

    expect(t('k', 'Name | Email')).toBe('Name | Email')
  })
})
