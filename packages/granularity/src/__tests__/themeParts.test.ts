import { grThemeCatalog } from '@feugene/granularity-tokens'
import { afterEach, describe, expect, it } from 'vitest'

import { modesOf, themeCss, themePartCss, THEMES } from './themeCss'

/**
 * Тема по частям — `themes/<тема>/root.css` и `themes/<тема>/<режим>.css`: приложение
 * без granum подключает `root` и только свои режимы. Гейт самодостаточности:
 * `root` и один режим дают элементу с парой режима те же значения, что тема
 * целиком, — токен, который режим взял бы у соседа через `:root`, здесь
 * пропал бы. jsdom считает каскад кастомных свойств, `var()` не подставляет —
 * сравниваются объявленные значения, и этого достаточно.
 */
afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
  document.head.innerHTML = ''
})

const BANNER_END = ' */\n'
const withoutBanner = (css: string): string => css.slice(css.indexOf(BANNER_END) + BANNER_END.length).trim()
const tokensOf = (css: string): string[] => [...new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1]))]

function valuesUnder(css: string, pairValue: string | null, tokens: readonly string[]): Record<string, string> {
  document.head.innerHTML = ''
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
  if (pairValue)
    document.documentElement.setAttribute('data-theme', pairValue)
  else
    document.documentElement.removeAttribute('data-theme')
  const computed = getComputedStyle(document.documentElement)

  return Object.fromEntries(tokens.map(token => [token, computed.getPropertyValue(token).trim()]))
}

describe.each(THEMES)('тема %s', (theme) => {
  const defaultMode = grThemeCatalog.find(entry => entry.id === theme)!.defaultMode
  const modes = modesOf(theme)

  it('целиком — склейка `root` и всех режимов', () => {
    const parts = [themePartCss(theme, 'root'), ...modes.map(({ mode }) => themePartCss(theme, mode))]

    expect(withoutBanner(themeCss(theme))).toBe(parts.map(withoutBanner).join('\n\n'))
  })

  it('`root` не знает режимов, `:root` — только у режима по умолчанию', () => {
    expect(withoutBanner(themePartCss(theme, 'root'))).not.toMatch(new RegExp(`data-theme="${theme}-`))
    for (const { mode } of modes) {
      const css = withoutBanner(themePartCss(theme, mode))
      expect(css.includes(':root'), mode).toBe(mode === defaultMode)
      expect(css, mode).toContain(`[data-theme="${theme}-${mode}"]`)
    }
  })

  it.each(modes.map(context => [context.key, context.mode] as const))('%s: `root` и один режим — те же значения, что целиком', (key, mode) => {
    const full = themeCss(theme)
    const tokens = tokensOf(full)
    const alone = `${themePartCss(theme, 'root')}\n${themePartCss(theme, mode)}`

    expect(valuesUnder(alone, key, tokens)).toEqual(valuesUnder(full, key, tokens))
  })

  it('без атрибута `root` и режим по умолчанию — те же значения, что целиком', () => {
    const full = themeCss(theme)
    const tokens = tokensOf(full)
    const alone = `${themePartCss(theme, 'root')}\n${themePartCss(theme, defaultMode)}`

    expect(valuesUnder(alone, null, tokens)).toEqual(valuesUnder(full, null, tokens))
  })
})
