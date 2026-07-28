import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { grDerivedTokens, grFoundationTokens, grThemeTokens } from '../tokens'

// В jsdom `import.meta.url` не file-scheme, поэтому пути — от cwd пакета,
// как в `cssContrast.ts`.
const pkgDir = process.cwd()

function readCss(relativePath: string): string {
  return readFileSync(resolve(pkgDir, relativePath), 'utf8')
}

/**
 * Гейт против ручной правки сгенерированных файлов.
 *
 * `tokens.css` и `themes/*.css` собираются из `tokens/*.json`, и единственный
 * способ узнать, что кто-то поправил CSS напрямую (или поменял JSON и забыл
 * перегенерировать), — прогнать генератор и сравнить. Без этого расхождение
 * всплывёт только в браузере без `color-mix`, то есть никогда.
 */
describe('токены как данные', () => {
  it('сгенерированные файлы совпадают с `tokens/*.json`', () => {
    expect(() => {
      execFileSync('node', ['scripts/generate-tokens.mjs', '--check'], {
        cwd: pkgDir,
        stdio: 'pipe',
      })
    }).not.toThrow()
  })

  it('каждая роль темы объявлена во всех темах', () => {
    for (const token of grThemeTokens) {
      expect(token.values.light, `${token.name} в light`).toMatch(/\S/)
      expect(token.values.dark, `${token.name} в dark`).toMatch(/\S/)
    }
  })

  it('TS-справочник и CSS содержат одни и те же примитивы', () => {
    const css = readCss('src/styles/tokens.css')

    for (const token of grFoundationTokens)
      expect(css).toContain(`${token.name}: ${token.value};`)

    expect(grFoundationTokens.length).toBeGreaterThan(0)
  })

  /**
   * Смысл фолбэка ровно в том, чтобы совпадать с `color-mix`. Значение в
   * `@supports`-блоке считает генератор, но проверяем независимо: hex из
   * TS-справочника обязан лежать в CSS соответствующей темы.
   */
  it('фолбэки производных состояний лежат в @supports-блоке своей темы', () => {
    const cssByTheme = {
      light: readCss('src/styles/themes/light.css'),
      dark: readCss('src/styles/themes/dark.css'),
    } as const

    for (const token of grDerivedTokens) {
      for (const theme of ['light', 'dark'] as const)
        expect(cssByTheme[theme], `${token.name} (${theme})`).toContain(`${token.name}: ${token.values[theme]};`)
    }
  })

  it('формула в CSS и формула в справочнике — одна и та же', () => {
    const css = readCss('src/styles/tokens.css')

    for (const token of grDerivedTokens)
      expect(css).toContain(`${token.name}: ${token.formula};`)
  })
})
