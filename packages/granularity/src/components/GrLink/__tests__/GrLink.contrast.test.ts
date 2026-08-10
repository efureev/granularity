import { describe, expect, it } from 'vitest'

import {
  derivedThemeVars,
  getContrastRatio,
  resolveColorExpression,
  themeVarsByName,
} from '../../../__tests__/cssContrast'
import { GR_TONES } from '../../shared/tones'
import { grLinkColorStyle } from '../grLinkStyles'

/**
 * Ссылка — это ТЕКСТ на фоне страницы, а значит порог у неё 4.5:1, а не 3:1.
 *
 * Гейт держит правило `docs/theming.md`: цвет текста берётся из роли `-text`,
 * насыщенный `--gr-{tone}` под текст не рассчитан. Раньше по этому правилу шли
 * семь тонов из восьми, а `primary` был исключением — и исключение не падало
 * ни на одном тесте, потому что контраст у него случайно проходил.
 *
 * Проверка идёт по `grLinkColorStyle` — публичной поверхности, из которой
 * компонент получает инлайновые переменные, а не по внутренней карте тонов.
 */
const BACKGROUNDS = ['--gr-bg', '--gr-card'] as const
const STATES = ['--gr-link-color', '--gr-link-color-hover', '--gr-link-color-active'] as const
const VARIANTS = ['default', 'muted'] as const

/**
 * Насыщенная роль тона в любом из трёх состояний. `-text`, `-solid` и прочие
 * суффиксы сюда не попадают: закрывающая скобка сразу за именем.
 */
const SATURATED_TONE = /var\(--gr-(?:primary|success|warning|danger|info|slate|azure)(?:-hover|-active)?\)/

describe('контраст ссылки', () => {
  for (const [themeName, themeVars] of Object.entries(themeVarsByName)) {
    for (const background of BACKGROUNDS) {
      it(`${themeName}: все тона читаемы на ${background}`, () => {
        const failures: string[] = []
        const backgroundColor = resolveColorExpression(`var(${background})`, themeVars, derivedThemeVars)

        for (const tone of GR_TONES) {
          for (const variant of VARIANTS) {
            const style = grLinkColorStyle({ tone, variant, disabled: false })

            for (const state of STATES) {
              const color = resolveColorExpression(style[state], themeVars, derivedThemeVars)
              const contrast = getContrastRatio(color, backgroundColor)

              if (contrast < 4.5) {
                failures.push(`${tone}/${variant}/${state}: ${contrast.toFixed(2)}`)
              }
            }
          }
        }

        expect(failures, 'текст ссылки обязан проходить AA — для этого у тона есть роль `-text`').toEqual([])
      })
    }
  }

  it('ни один тон не берёт цвет из насыщенной роли', () => {
    const offenders: string[] = []

    for (const tone of GR_TONES) {
      for (const variant of VARIANTS) {
        const style = grLinkColorStyle({ tone, variant, disabled: false })

        for (const state of STATES) {
          if (SATURATED_TONE.test(style[state])) {
            offenders.push(`${tone}/${variant}/${state}: ${style[state]}`)
          }
        }
      }
    }

    expect(offenders, 'цвет текста — из `var(--gr-{tone}-text)`, а не из заливки').toEqual([])
  })

  /**
   * Обратная сторона: запрет выше выполняется и пустой картой. Здесь
   * проверяется, что роли `-text` действительно в ходу.
   */
  it('тона идут через роли `-text`', () => {
    const colored = GR_TONES.filter(tone => tone !== 'neutral')
    const missing = colored.filter(tone =>
      !grLinkColorStyle({ tone, variant: 'default', disabled: false })['--gr-link-color'].includes(`--gr-${tone}-text`))

    expect(missing).toEqual([])
  })
})
