import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL, URL } from 'node:url'

import { emitCss, prepareApp } from '@feugene/granum/node'
import { validateGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'
import { afterAll, describe, expect, it } from 'vitest'

import { grThemeTokens } from '@feugene/granularity/tokens'

/**
 * Рецепты «Подключение» из `packages/granularity/docs/theming.md` — на настоящем
 * granum и манифесте пакета.
 *
 * Темы пакета приезжают CSS-файлами, и рецепт работает, только если значение
 * приложения встаёт после файла темы под её селектор. Тест проверяет ровно это:
 * в слое `themes` последнее объявление `--gr-primary` для тёмной темы — значение
 * приложения.
 */

const root = fileURLToPath(new URL('../../', import.meta.url))
const scratch = mkdtempSync(join(tmpdir(), 'theme-recipes-'))
afterAll(() => rmSync(scratch, { recursive: true, force: true }))

const darkPrimary = grThemeTokens.find(token => token.name === '--gr-primary')!.values.dark
const base = {
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: [] as string[],
  appSources: { dirs: [] as string[] },
}

async function themesLayer(themes: Record<string, unknown>): Promise<string> {
  const config = { ...base, themes }
  validateGranumConfig(config)
  return (await emitCss(await prepareApp(config as Parameters<typeof prepareApp>[0], root))).layers.themes
}

/** Блоки слоя по порядку: селектор и значение `--gr-primary`, если оно есть. */
function primaryBlocks(css: string): Array<{ selector: string, primary: string }> {
  return [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map(([, selector, body]) => ({ selector: selector!.trim(), primary: /--gr-primary:\s*([^;]+)/.exec(body!)?.[1]?.trim() ?? '' }))
    .filter(block => block.primary)
}

function lastDarkPrimary(css: string): string | undefined {
  return primaryBlocks(css).filter(block => block.selector.includes('[data-theme=\'dark\']')).at(-1)?.primary
}

describe('рецепты темизации из theming.md', () => {
  it('тема пакета приезжает файлом: без рецепта у тёмной темы её собственный primary', async () => {
    expect(lastDarkPrimary(await themesLayer({ names: ['light', 'dark'] }))).toBe(darkPrimary)
  })

  it('точечный override: tokenOverrides побеждает файл тёмной темы', async () => {
    const css = await themesLayer({ names: ['light', 'dark'], tokenOverrides: { dark: { 'gr-primary': '#4fd1e0' } } })

    expect(lastDarkPrimary(css)).toBe('#4fd1e0')
  })

  it('ключ с `--` — ошибка конфига, а не `----gr-primary`', () => {
    expect(() => validateGranumConfig({
      ...base,
      themes: { names: ['light', 'dark'], tokenOverrides: { dark: { '--gr-primary': '#4fd1e0' } } },
    })).toThrow(/must not start with '--'/)
  })

  it('перекрасить встроенную тему: define.dark.tokensRef ложится поверх файла пакета', async () => {
    const file = join(scratch, 'dark-rebrand.css')
    writeFileSync(file, '[data-theme=\'dark\'] { --gr-primary: #ff00aa; }\n')

    const css = await themesLayer({ names: ['light', 'dark'], define: { dark: { tokensRef: pathToFileURL(file).href } } })

    expect(lastDarkPrimary(css)).toBe('#ff00aa')
    // Файл пакета остаётся: роли, которых в файле приложения нет, приходят из него.
    expect(primaryBlocks(css).some(block => block.primary === darkPrimary)).toBe(true)
  })

  it('третья тема: define с extends наследует тёмную и встаёт под свой data-theme', async () => {
    const css = await themesLayer({
      names: ['light', 'dark', 'ocean'],
      define: { ocean: { extends: 'dark', tokens: { 'gr-primary': '#0ea5e9' } } },
    })
    const ocean = [...css.matchAll(/\[data-theme="ocean"\]\s*\{([^}]*)\}/g)].map(match => match[1]!).join('\n')
    const darkBg = grThemeTokens.find(token => token.name === '--gr-bg')!.values.dark

    expect(ocean).toContain('--gr-primary: #0ea5e9')
    expect(ocean).toContain(`--gr-bg: ${darkBg}`)
  })

  it('ключа themes.themeFiles пресета v1 у granum нет', () => {
    expect(() => validateGranumConfig({
      ...base,
      themes: { names: ['light', 'dark'], themeFiles: { dark: './x.css' } },
    })).toThrow(/unknown option/)
  })
})
