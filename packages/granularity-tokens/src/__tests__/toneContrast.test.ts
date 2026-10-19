import { describe, expect, it } from 'vitest'

import { TONE_ROLES } from '@feugene/granularity-test-kit/gates'

import { contrastOf, pairs, type ThemePair } from './themes'

/**
 * Сторож списка тонов, которым запрещена роль переднего плана.
 *
 * Правило «тон не красит текст» проверяется статически — по имени токена, — и
 * поэтому список запрещённых имён живёт в тест-ките. Список, взятый с потолка,
 * протух бы при первой же перекраске темы: сегодня `--gr-primary` проваливает
 * AA только в тёмном режиме, завтра, посветлев, провалит и светлый, а гейт
 * продолжит пропускать его молча.
 *
 * Здесь список сверяется с фактом: каждый запрещённый тон обязан действительно
 * не держать контраст хотя бы в одной паре «тема × режим», и у каждого обязана
 * быть парная `-text`-роль, которая держит его везде. Иначе запрет — суеверие.
 *
 * Порог 4.5 — AA для обычного текста. Нетекстовым элементам хватило бы 3:1, но
 * различить их статически нельзя: иконка красится тем же `text-*`, что и
 * подпись, и рядом с ней обязана быть той же читаемости.
 */
const AA_TEXT = 4.5

/** Подложки, на которых цвет переднего плана оказывается в реальной вёрстке. */
const SURFACES = ['--gr-card', '--gr-muted'] as const

/** Худший контраст токена по всем подложкам пары. */
function worstRatio(pair: ThemePair, token: string): number | undefined {
  if (!pair.vars[token])
    return undefined

  return Math.min(...SURFACES.map(surface => contrastOf(`var(${token})`, `var(${surface})`, pair)))
}

describe('запрет тона в роли текста опирается на контраст', () => {
  it.each(TONE_ROLES)('`--gr-%s` действительно провален хотя бы в одной паре', (tone) => {
    const measured = pairs
      .map(pair => ({ pair: pair.label, ratio: worstRatio(pair, `--gr-${tone}`) }))
      .filter((entry): entry is { pair: string, ratio: number } => entry.ratio !== undefined)

    expect(measured.length, `--gr-${tone} не объявлен ни в одной паре`).toBeGreaterThan(0)

    const failing = measured.filter(entry => entry.ratio < AA_TEXT)

    expect(
      failing.map(entry => entry.pair),
      `--gr-${tone} держит AA везде (${measured.map(e => `${e.pair}: ${e.ratio.toFixed(2)}`).join(', ')}) — `
      + 'запрет на него больше ничем не обоснован, убери тон из списка тест-кита',
    ).not.toEqual([])
  })

  it.each(TONE_ROLES)('парная роль `--gr-%s-text` держит AA везде', (tone) => {
    for (const pair of pairs) {
      const ratio = worstRatio(pair, `--gr-${tone}-text`)

      expect(ratio, `нет --gr-${tone}-text в ${pair.label}`).toBeDefined()
      expect(ratio!, `--gr-${tone}-text в ${pair.label}`).toBeGreaterThanOrEqual(AA_TEXT)
    }
  })
})
