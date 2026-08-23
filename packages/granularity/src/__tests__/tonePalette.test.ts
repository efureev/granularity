import { describe, expect, it } from 'vitest'

import {
  derivedThemeVars,
  getColorDistance,
  resolveColorExpression,
  themeVarsByName,
} from './cssContrast'

/**
 * Тона обязаны различаться глазом, а не только hex'ом.
 *
 * Дефект, ради которого гейт написан: `--gr-primary-text` и `--gr-info-text`
 * совпадали значением полностью, а базовые заливки тех же тонов расходились на
 * ΔE 4.3 при пороге заметности около 2.3. Ссылка `tone="info"` и ссылка
 * `tone="primary"` красились одинаково, и ни один тест этого не видел: контраст
 * у обеих проходил, а сравнивать тона между собой было некому.
 *
 * Пороги — храповик от текущего состояния, а не эстетический закон. Роли
 * сходятся по-разному: бледные подложки `-light` близки по природе, заливки
 * сравнивают рядом в галерее тонов и они обязаны расходиться заметно. Числа
 * ниже с запасом от фактических минимумов — гейт ловит регресс, а не
 * подкручивает палитру.
 */
const TONES = ['primary', 'success', 'warning', 'danger', 'info', 'slate', 'azure'] as const

/**
 * `-light` у `primary` нет: мягкая подложка бренда называется `--gr-accent` и
 * живёт в группе action-ролей. Состав ролей зафиксирован здесь же, чтобы гейт
 * падал и на исчезнувшей роли, а не только на слившихся тонах.
 */
const ROLES: { suffix: string, minDistance: number, why: string, tones: readonly string[] }[] = [
  { suffix: '', minDistance: 15, why: 'заливки стоят рядом в галерее тонов', tones: TONES },
  { suffix: '-light', minDistance: 4, why: 'бледные подложки сходятся по природе', tones: TONES.filter(tone => tone !== 'primary') },
  { suffix: '-text', minDistance: 6, why: 'текст тона на фоне страницы', tones: TONES },
  { suffix: '-solid', minDistance: 6, why: 'кнопки разных тонов в одном ряду', tones: TONES },
]

describe('различимость тонов', () => {
  for (const [themeName, themeVars] of Object.entries(themeVarsByName)) {
    for (const { suffix, minDistance, why, tones } of ROLES) {
      it(`${themeName}: роль \`${suffix || 'без суффикса'}\` расходится по тонам (${why})`, () => {
        const missing = tones.filter(tone => !themeVars[`--gr-${tone}${suffix}`])
        expect(missing, `роль \`${suffix}\` объявлена не у всех тонов`).toEqual([])

        const colors = tones.map(tone => ({
          tone,
          color: resolveColorExpression(themeVars[`--gr-${tone}${suffix}`], themeVars, derivedThemeVars),
        }))

        const offenders: string[] = []

        for (let first = 0; first < colors.length; first++) {
          for (let second = first + 1; second < colors.length; second++) {
            const distance = getColorDistance(colors[first].color, colors[second].color)

            if (distance < minDistance) {
              offenders.push(`${colors[first].tone}/${colors[second].tone}: ΔE ${distance.toFixed(1)}`)
            }
          }
        }

        expect(offenders, `ΔE < ${minDistance}: тона сливаются`).toEqual([])
      })
    }
  }

  /**
   * Отдельно и без порогов: полное совпадение значений — всегда ошибка, в любой
   * роли. Именно так дефект и выглядел, а расстояние 0 не спишешь на вкус.
   */
  it('ни одна роль не повторяет значение у двух тонов', () => {
    const offenders: string[] = []

    for (const [themeName, themeVars] of Object.entries(themeVarsByName)) {
      for (const { suffix, tones } of ROLES) {
        const seen = new Map<string, string>()

        for (const tone of tones) {
          const expression = themeVars[`--gr-${tone}${suffix}`]
          if (!expression)
            continue

          const color = resolveColorExpression(expression, themeVars, derivedThemeVars)
          const key = `${color.r},${color.g},${color.b}`
          const twin = seen.get(key)

          if (twin)
            offenders.push(`${themeName} \`${suffix || 'base'}\`: ${twin} = ${tone}`)
          else seen.set(key, tone)
        }
      }
    }

    expect(offenders).toEqual([])
  })
})
