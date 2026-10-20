import { grThemeCatalog } from '@feugene/granularity-tokens'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { componentFormulaTokens, modesOf, pair, themeCss, THEMES, themeVars } from './themeCss'

/**
 * Режимы каждой темы каталога по CSS, который получает потребитель: остров
 * режима, пара на корне и порядок слоёв в `themes/<тема>.css`.
 *
 * jsdom считает каскад и наследование кастомных свойств, но `var()` в них не
 * подставляет. Поэтому «пересчитано ли на острове» видно по метке: её ставим
 * на `<html>` инлайном, и элемент острова получает метку только тогда, когда
 * своего объявления у него нет — значение `var()` подставляется там, где
 * свойство объявлено, и унаследованная формула посчитана от ролей страницы.
 */
const SENTINEL = 'inherited-from-root'

let css: string

afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('style')
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

function mount(page: string | null | undefined, island: string | undefined): HTMLElement {
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
  if (page)
    document.documentElement.setAttribute('data-theme', page)
  document.body.innerHTML = `<div data-theme="${island ?? ''}"><span data-inner></span></div>`

  return document.querySelector<HTMLElement>('[data-inner]')!
}

const valueOf = (element: Element, token: string): string => getComputedStyle(element).getPropertyValue(token).trim()

function inheritedFromRoot(inner: HTMLElement, tokens: readonly string[]): string[] {
  for (const token of tokens)
    document.documentElement.style.setProperty(token, SENTINEL)

  return tokens.filter(token => valueOf(inner, token) === SENTINEL)
}

describe.each(THEMES)('тема %s', (theme) => {
  // Остров — режим другой схемы, чем у страницы: режим по умолчанию (у тем
  // каталога он светлый) и первый тёмный.
  const LIGHT = pair(theme, grThemeCatalog.find(entry => entry.id === theme)!.defaultMode)
  const DARK = modesOf(theme).find(context => context.colorScheme === 'dark')?.key

  beforeAll(() => {
    css = themeCss(theme)
  })

  it('у темы есть тёмный режим — острову есть что показать', () => {
    expect(DARK).toBeDefined()
  })

  describe('остров режима', () => {
    it('светлый остров внутри тёмной страницы получает светлые роли', () => {
      const inner = mount(DARK, LIGHT)

      expect(valueOf(document.documentElement, '--gr-bg')).toBe(themeVars(DARK!)['--gr-bg'])
      expect(valueOf(inner, '--gr-bg')).toBe(themeVars(LIGHT)['--gr-bg'])
    })

    it('тёмный остров внутри светлой страницы получает тёмные роли', () => {
      const inner = mount(null, DARK)

      expect(valueOf(document.documentElement, '--gr-bg')).toBe(themeVars(LIGHT)['--gr-bg'])
      expect(valueOf(inner, '--gr-bg')).toBe(themeVars(DARK!)['--gr-bg'])
    })

    it('остров объявляет `color-scheme` своего режима — нативные контролы следуют за ним', () => {
      expect(valueOf(mount(null, DARK), 'color-scheme')).toBe('dark')
      expect(valueOf(mount(DARK, LIGHT), 'color-scheme')).toBe('light')
    })

    it('производные формулы пересчитываются на острове', () => {
      expect(inheritedFromRoot(mount(DARK, LIGHT), ['--gr-primary-hover', '--gr-brd-active'])).toEqual([])
    })

    // D1: soft-фоны, рамки и недоступное состояние кнопки были объявлены только
    // в светлом блоке, и тёмный остров наследовал их посчитанными по светлым ролям.
    describe('формулы токенов компонентов пересчитываются на острове (D1)', () => {
      const formulas = componentFormulaTokens(theme)

      it('формулы есть — гейт не пуст', () => {
        expect(formulas.length).toBeGreaterThan(40)
      })

      it('тёмный остров на светлой странице', () => {
        expect(inheritedFromRoot(mount(null, DARK), formulas)).toEqual([])
      })

      it('светлый остров на тёмной странице', () => {
        expect(inheritedFromRoot(mount(DARK, LIGHT), formulas)).toEqual([])
      })
    })
  })

  describe('пара режима на корне', () => {
    // D2: тёмное значение висело только на `.dark`, а штатный атрибут его не включал.
    it('подсветка индикатора `GrSegmented` на тёмной паре — тёмная (D2)', () => {
      const token = '--gr-segmented-indicator-highlight-shadow'
      mount(null, LIGHT)
      const light = valueOf(document.documentElement, token)
      document.documentElement.setAttribute('data-theme', DARK!)

      expect(light).not.toBe('')
      expect(valueOf(document.documentElement, token)).not.toBe(light)
    })

    it('без атрибута действует режим по умолчанию', () => {
      mount(null, LIGHT)

      expect(valueOf(document.documentElement, '--gr-bg')).toBe(themeVars(LIGHT)['--gr-bg'])
      expect(valueOf(document.documentElement, 'color-scheme')).toBe('light')
    })

    it('классы `.light`/`.dark` режим не включают', () => {
      expect(css).not.toMatch(/\.(?:light|dark)\b/)
    })
  })

  // D4: в прежнем `styles/index.css` темы шли до `tokens.css`, и формула при равной
  // специфичности перебивала фолбэк `@supports`, объявленный раньше неё.
  describe('порядок слоёв в `themes/<тема>.css` (D4)', () => {
    const firstFallback = () => css.indexOf('@supports')

    // Файл — склейка `root.css` и режимов: фолбэк режима идёт за его блоком, а не
    // за всеми режимами. Блок другого режима ниже фолбэка ничего не ломает —
    // на элементе с той парой он и должен побеждать фолбэк, пришедший через `:root`.
    it('фолбэки `@supports` идут после формул `root` и после блока своего режима', () => {
      const root = css.indexOf(`[data-theme="${LIGHT}"] {`)
      const lastRootFormula = Math.max(...[...css.slice(0, root).matchAll(/^\s*--gr-[\w-]+: color-mix\(/gm)].map(match => match.index))

      expect(firstFallback()).toBeGreaterThan(lastRootFormula)
      for (const key of [LIGHT, DARK!]) {
        const own = css.indexOf(`[data-theme="${key}"] {`)
        const fallback = css.indexOf(`[data-theme="${key}"] {`, css.indexOf('@supports', own))

        expect(fallback, key).toBeGreaterThan(own)
      }
    })

    // Фолбэк режима по умолчанию не выходит под голым `:root`: в браузере без
    // `color-mix` он совпал бы с `<html data-theme="<тёмная пара>">` и перебил бы
    // тёмный режим на корне. Корень без атрибута и своя пара — этого хватает.
    it('фолбэк режима по умолчанию — на корне без атрибута и своей паре, тёмного — на своей паре', () => {
      const fallbacks = css.slice(firstFallback())

      expect(fallbacks).toContain(`  :root:not([data-theme]), [data-theme="${LIGHT}"] {`)
      expect(fallbacks).not.toContain(`  :root, [data-theme="${LIGHT}"] {`)
      expect(fallbacks).toContain(`  [data-theme="${DARK}"] {`)
    })

    // Примитивы — под корнем без атрибута и парами темы, а не под голым `:root`:
    // корень с парой другой темы их не получает (T-8 granum).
    it('примитивы — до режимов, под корнем без атрибута и парами темы', () => {
      const primitives = css.search(/^:root:not\(\[data-theme\]\), \[data-theme="[^"]+"\](?:, \[data-theme="[^"]+"\])* \{$/m)

      expect(primitives).toBeGreaterThan(-1)
      expect(css.slice(primitives, css.indexOf('{', primitives))).toContain(`[data-theme="${LIGHT}"]`)
      expect(primitives).toBeLessThan(css.indexOf(`[data-theme="${LIGHT}"] {`))
    })
  })
})
