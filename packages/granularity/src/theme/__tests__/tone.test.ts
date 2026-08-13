import { describe, expect, it } from 'vitest'

import { contrast, mixSrgb } from '../color'
import { extendTheme } from '../extendTheme'
import { GrToneError, tone } from '../tone'
import { validateTheme } from '../validate'

const AA = 4.5

describe('семья ролей из одного цвета', () => {
  it('в тёмной теме выдаёт полный набор ролей тона', () => {
    const family = tone('success', '#3ddc97', { base: 'dark' })

    expect(Object.keys(family).sort()).toEqual([
      '--gr-success',
      '--gr-success-fg',
      '--gr-success-light',
      '--gr-success-solid',
      '--gr-success-solid-fg',
      '--gr-success-text',
    ])
  })

  it('текст на заливке читается и в hover, и в active — не только на базе', () => {
    const base = 'dark'
    const family = tone('success', '#3ddc97', { base })
    const fill = family['--gr-success']
    const fg = family['--gr-success-fg']

    // Формула состояний та же, что у пакета: подмес `--gr-fg` 8% и 16%.
    const themeFg = extendTheme({ name: 'x', base, validate: false }).tokens['--gr-fg']

    expect(contrast(fg, fill)).toBeGreaterThanOrEqual(AA)
    expect(contrast(fg, mixSrgb(fill, themeFg, 92))).toBeGreaterThanOrEqual(AA)
    expect(contrast(fg, mixSrgb(fill, themeFg, 84))).toBeGreaterThanOrEqual(AA)
  })

  it('solid держит свой текст, а `-text` читается на подложке, фоне и карточке', () => {
    const theme = extendTheme({ name: 'x', base: 'light', validate: false }).tokens
    const family = tone('brand', '#7c9cf5', { base: 'light' })

    expect(contrast(family['--gr-brand-solid-fg'], family['--gr-brand-solid'])).toBeGreaterThanOrEqual(AA)

    for (const surface of [family['--gr-brand-light'], theme['--gr-bg'], theme['--gr-card']])
      expect(contrast(family['--gr-brand-text'], surface)).toBeGreaterThanOrEqual(AA)
  })

  it('семя, на котором не читается ни один полюс темы, — падает с именем роли', () => {
    // Средне-серый: и тёмный, и светлый текст дают на нём меньше 4.5:1.
    // Полутон посередине шкалы — типичная ошибка «взял серый как тон».
    expect(() => tone('pale', '#767676', { base: 'light' })).toThrow(GrToneError)

    try {
      tone('pale', '#767676', { base: 'light' })
    }
    catch (error) {
      expect((error as Error).message).toContain('--gr-pale-fg')
      expect((error as Error).message).toMatch(/максимум \d+\.\d+:1/)
    }
  })

  it('можно выводить не всю семью, а нужные роли', () => {
    const family = tone('brand', '#3ddc97', { base: 'dark', roles: ['fill'] })

    expect(Object.keys(family)).toEqual(['--gr-brand', '--gr-brand-fg'])
  })

  /** Смысл упражнения: перекрашенный тон не должен ронять проверку темы. */
  it('тон, вставленный в тему, проходит её проверку', () => {
    const theme = extendTheme({
      name: 'ocean',
      base: 'dark',
      tokens: tone('success', '#3ddc97', { base: 'dark' }),
      validate: false,
    })

    const issues = validateTheme(theme).filter(issue => issue.token.startsWith('--gr-success'))

    expect(issues.map(issue => issue.message)).toEqual([])
  })
})
