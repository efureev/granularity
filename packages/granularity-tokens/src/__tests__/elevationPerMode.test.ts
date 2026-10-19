import { describe, expect, it } from 'vitest'

import { grFoundationTokens, grRoleTokens } from '../generated'
import { pairs, themes } from './themes'

/**
 * Тень обязана быть видна в своём режиме.
 *
 * Дефект, ради которого гейт написан: уровни elevation жили одним набором в
 * примитивах и красились полупрозрачным `rgba(15, 23, 42, …)` — тем же цветом,
 * что `--gr-bg` тёмного режима. На тёмном фоне такая тень не даёт ничего, и
 * поднятая поверхность теряла один из двух каналов подъёма: в светлом режиме
 * карточку держат светлота и тень, в тёмном оставалась только светлота.
 * Страница читалась одним полотном, и жалоба звучала как «карточки не
 * отделяются» — хотя пара `--gr-card`/`--gr-bg` в тёмном режиме разведена
 * **сильнее** светлого (ΔL* 8.4 против 1.8).
 *
 * Проверяется не эстетика, а сам факт расхождения: тень тёмного режима не может
 * совпадать со светлой, потому что фон под ней другой.
 */
const LEVELS = ['--gr-shadow-1', '--gr-shadow-2', '--gr-shadow-3'] as const

/** Альфа последнего `rgba(…)` в значении тени. */
function shadowAlpha(value: string): number {
  const last = [...value.matchAll(/rgba?\(([^)]*)\)/g)].at(-1)?.[1]

  return last === undefined ? Number.NaN : Number(last.split(',').at(-1)!.trim())
}

describe('elevation по режимам', () => {
  it('уровни 1–3 — роли режима, а не примитивы', () => {
    const roles = new Set(grRoleTokens.map(token => token.name))
    const primitives = new Set(grFoundationTokens.map(token => token.name))

    for (const level of LEVELS) {
      expect(roles.has(level), `${level} не роль`).toBe(true)
      expect(primitives.has(level), `${level} объявлен и примитивом: \`:root\` перебьёт режим при равной специфичности`).toBe(false)
    }
  })

  it('каждый режим объявляет все уровни', () => {
    for (const pair of pairs) {
      const missing = LEVELS.filter(level => !pair.vars[level])

      expect(missing, `${pair.label} не объявляет ${missing.join(', ')}`).toEqual([])
    }
  })

  // На тёмном фоне тень читается только заметно более плотной: та же альфа,
  // что и на светлом, визуально исчезает.
  it.each(themes.map(theme => [theme.id] as const))('%s: тень тёмного режима плотнее светлого и не повторяет его', (id) => {
    const ofTheme = pairs.filter(pair => pair.theme.id === id)
    const light = ofTheme.filter(pair => pair.colorScheme === 'light')
    const dark = ofTheme.filter(pair => pair.colorScheme === 'dark')

    expect(light.length * dark.length, `${id}: нужен хотя бы один светлый и один тёмный режим`).toBeGreaterThan(0)

    for (const lightPair of light) {
      for (const darkPair of dark) {
        for (const level of LEVELS) {
          const [lightValue, darkValue] = [lightPair.vars[level], darkPair.vars[level]]

          expect(darkValue, `${level}: ${darkPair.label} повторяет ${lightPair.label}`).not.toBe(lightValue)
          expect(Number.isNaN(shadowAlpha(lightValue)), `${level}: не разобрана альфа ${lightPair.label}`).toBe(false)
          expect(shadowAlpha(darkValue), `${level}: ${darkPair.label} не плотнее ${lightPair.label}`).toBeGreaterThan(shadowAlpha(lightValue))
        }
      }
    }
  })
})
