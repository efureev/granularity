import { describe, expect, it } from 'vitest'

import { TONE_ROLES } from '@feugene/granularity-test-kit/gates'

import { getContrastRatio, themeVarsByName, type ThemeName } from './cssContrast'

/**
 * Сторож списка тонов, которым запрещена роль переднего плана.
 *
 * Правило «тон не красит текст» проверяется статически — по имени токена, — и
 * поэтому список запрещённых имён живёт в тест-ките. Список, взятый с потолка,
 * протух бы при первой же перекраске темы: сегодня `--gr-primary` проваливает
 * AA только в тёмной, завтра, посветлев, провалит и светлую, а гейт продолжит
 * пропускать его молча.
 *
 * Здесь список сверяется с фактом: каждый запрещённый тон обязан действительно
 * не держать контраст хотя бы в одной теме, и у каждого обязана быть парная
 * `-text`-роль, которая держит его везде. Иначе запрет — суеверие.
 *
 * Порог 4.5 — AA для обычного текста. Нетекстовым элементам хватило бы 3:1, но
 * различить их статически нельзя: иконка красится тем же `text-*`, что и
 * подпись, и рядом с ней обязана быть той же читаемости.
 */
const AA_TEXT = 4.5

/** Подложки, на которых цвет переднего плана оказывается в реальной вёрстке. */
const SURFACES = ['--gr-card', '--gr-muted'] as const

const THEMES = Object.keys(themeVarsByName) as ThemeName[]

function hexOf(theme: ThemeName, token: string): string | undefined {
  const value = themeVarsByName[theme][token]

  return value?.startsWith('#') ? value : undefined
}

function parse(hex: string): { r: number, g: number, b: number } {
  const [r = 0, g = 0, b = 0] = (hex.replace('#', '').match(/../g) ?? []).map(part => Number.parseInt(part, 16))

  return { r, g, b }
}

/** Худший контраст токена по всем подложкам темы. */
function worstRatio(theme: ThemeName, token: string): number | undefined {
  const foreground = hexOf(theme, token)
  if (!foreground) return undefined

  const ratios = SURFACES
    .map(surface => hexOf(theme, surface))
    .filter((value): value is string => value !== undefined)
    .map(surface => getContrastRatio(parse(foreground), parse(surface)))

  return ratios.length > 0 ? Math.min(...ratios) : undefined
}

describe('запрет тона в роли текста опирается на контраст', () => {
  it.each(TONE_ROLES)('`--gr-%s` действительно провален хотя бы в одной теме', (tone) => {
    const measured = THEMES
      .map(theme => ({ theme, ratio: worstRatio(theme, `--gr-${tone}`) }))
      .filter((entry): entry is { theme: ThemeName, ratio: number } => entry.ratio !== undefined)

    expect(measured.length, `у --gr-${tone} нет hex ни в одной теме`).toBeGreaterThan(0)

    const failing = measured.filter(entry => entry.ratio < AA_TEXT)

    expect(
      failing.map(entry => entry.theme),
      `--gr-${tone} держит AA везде (${measured.map(e => `${e.theme}: ${e.ratio.toFixed(2)}`).join(', ')}) — `
      + 'запрет на него больше ничем не обоснован, убери тон из списка тест-кита',
    ).not.toEqual([])
  })

  it.each(TONE_ROLES)('парная роль `--gr-%s-text` держит AA везде', (tone) => {
    for (const theme of THEMES) {
      const ratio = worstRatio(theme, `--gr-${tone}-text`)

      expect(ratio, `нет --gr-${tone}-text в теме ${theme}`).toBeDefined()
      expect(ratio!, `--gr-${tone}-text в теме ${theme}`).toBeGreaterThanOrEqual(AA_TEXT)
    }
  })
})
