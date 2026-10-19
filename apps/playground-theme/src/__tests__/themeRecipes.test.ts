import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL, URL } from 'node:url'

import { emitCss, prepareApp } from '@feugene/granum/node'
import { validateGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'
import { afterAll, describe, expect, it } from 'vitest'

import { type GrThemeData, resolveModes } from '@feugene/granularity-tokens'
import { loadTheme } from '@feugene/granularity-tokens/theme/node'
import slateData from '@feugene/granularity-tokens/themes/slate/theme.json'

/**
 * Рецепты «Свои режимы в конфиге» из `packages/granularity/docs/modes.md` и «Своя тема приложения» из `packages/granularity-tokens/docs/themes.md`
 * — на настоящем granum и манифесте пакета.
 *
 * Тема пакета приезжает данными каталога, режим включается парой
 * `data-theme="slate-<режим>"`. Рецепт работает, только если значение
 * приложения ложится в блок своей пары после данных темы: тест проверяет ровно
 * это — последнее объявление `--gr-primary` под парой.
 */

const root = fileURLToPath(new URL('../../', import.meta.url))
const scratch = mkdtempSync(join(tmpdir(), 'theme-recipes-'))
afterAll(() => rmSync(scratch, { recursive: true, force: true }))

const dark = resolveModes(slateData as GrThemeData).get('dark')!
const darkPrimary = dark['gr-primary']!
const base = {
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: [] as string[],
  appSources: { dirs: [] as string[] },
  theme: 'slate',
}

async function themesLayer(modes: Record<string, unknown>, theme: unknown = base.theme): Promise<string> {
  const config = { ...base, theme, modes }
  validateGranumConfig(config)
  return (await emitCss(await prepareApp(config as Parameters<typeof prepareApp>[0], root))).layers.themes
}

/** Блоки слоя по порядку: селектор и значение `--gr-primary`, если оно есть. */
function primaryBlocks(css: string): Array<{ selector: string, primary: string }> {
  return [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map(([, selector, body]) => ({ selector: selector!.trim(), primary: /--gr-primary:\s*([^;]+)/.exec(body!)?.[1]?.trim() ?? '' }))
    .filter(block => block.primary)
}

function lastPrimary(css: string, pair: string): string | undefined {
  return primaryBlocks(css).filter(block => block.selector.includes(`[data-theme="${pair}"]`)).at(-1)?.primary
}

describe('рецепты режимов и темы из modes.md и themes.md', () => {
  it('тема пакета приезжает данными: у тёмного режима его собственный primary', async () => {
    expect(lastPrimary(await themesLayer({ names: ['light', 'dark'] }), 'slate-dark')).toBe(darkPrimary)
  })

  it('точечный override: tokenOverrides режима побеждает данные темы', async () => {
    const css = await themesLayer({ names: ['light', 'dark'], tokenOverrides: { dark: { 'gr-primary': '#4fd1e0' } } })

    expect(lastPrimary(css, 'slate-dark')).toBe('#4fd1e0')
  })

  it('ключ с `--` — ошибка конфига, а не `----gr-primary`', () => {
    expect(() => validateGranumConfig({
      ...base,
      modes: { names: ['light', 'dark'], tokenOverrides: { dark: { '--gr-primary': '#4fd1e0' } } },
    })).toThrow(/must not start with '--'/)
  })

  it('свой режим из файла: define.<имя>.tokensRef поверх тёмного, остальное — от него', async () => {
    const file = join(scratch, 'rebrand.css')
    writeFileSync(file, ':root { --gr-primary: #ff00aa; }\n')

    const css = await themesLayer({ names: ['light', 'dark', 'rebrand'], define: { rebrand: { extends: 'dark', tokensRef: pathToFileURL(file).href } } })
    const rebrand = [...css.matchAll(/\[data-theme="slate-rebrand"\]\s*\{([^}]*)\}/g)].map(match => match[1]!).join('\n')

    expect(lastPrimary(css, 'slate-rebrand')).toBe('#ff00aa')
    expect(rebrand).toContain(`--gr-bg: ${dark['gr-bg']}`)
    expect(lastPrimary(css, 'slate-dark')).toBe(darkPrimary)
  })

  it('третий режим: define с extends наследует тёмный и встаёт под свою пару', async () => {
    const css = await themesLayer({
      names: ['light', 'dark', 'ocean'],
      define: { ocean: { extends: 'dark', tokens: { 'gr-primary': '#0ea5e9' } } },
    })
    const ocean = [...css.matchAll(/\[data-theme="slate-ocean"\]\s*\{([^}]*)\}/g)].map(match => match[1]!).join('\n')

    expect(ocean).toContain('--gr-primary: #0ea5e9')
    expect(ocean).toContain(`--gr-bg: ${dark['gr-bg']}`)
  })

  it('своя тема из папки активной: её режимы под :root и своими парами, отличия поверх «Сланца»', async () => {
    const brand = loadTheme(new URL('../themes/brand/', import.meta.url))
    const css = await themesLayer({ names: ['light', 'dark'] }, brand)

    expect(brand.extends).toBe('slate')
    expect(css).toContain(':root, [data-theme="brand-light"]')
    expect(lastPrimary(css, 'brand-dark')).toBe('#5eead4')
    expect(css).not.toContain('data-theme="slate-')
  })

  it('ключа `themes` у granum 3 нет — подсказка ведёт к `theme` и `modes`', () => {
    expect(() => validateGranumConfig({
      ...base,
      themes: { names: ['light', 'dark'] },
    })).toThrow(/modes/)
  })
})
