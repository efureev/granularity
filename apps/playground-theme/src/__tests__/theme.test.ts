import { fileURLToPath, URL } from 'node:url'

import { emitCss, prepareApp } from '@feugene/granum/node'
import { beforeAll, describe, expect, it } from 'vitest'

import { grRoleTokens, type GrThemeData, resolveModes } from '@feugene/granularity-tokens'
import slateData from '@feugene/granularity-tokens/themes/slate/theme.json'

import granumConfig from '../../granum.config'
import { contrast as contrastMode, ocean } from '../../theme.config'

/**
 * Проверка своих режимов и своей темы — ровно та, что описана в
 * `packages/granularity/docs/theming.md`.
 *
 * Режимы собраны `extendMode`/`createMode` (`theme.config.ts`), поэтому
 * полнота набора обеспечена построением, а не бдительностью. Контраст здесь
 * проверяется по собранному набору ролей — тому, что увидит браузер, — и
 * служит образцом такой проверки для приложения. Отдельно — что granum
 * действительно положил режимы и превью под их пары.
 */

/** Объявления блока: `--gr-x: value;` вне комментариев. */
function parseDeclarations(css: string): Map<string, string> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')

  return new Map(
    [...withoutComments.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)]
      .map(match => [match[1], match[2].trim()]),
  )
}

const declarations = new Map(Object.entries(ocean.tokens))

// --- контраст (WCAG 2.1) ---------------------------------------------------

function toRgb(hex: string): [number, number, number] {
  const normalized = hex.trim().replace('#', '')
  const full = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized

  return [0, 2, 4].map(offset => Number.parseInt(full.slice(offset, offset + 2), 16)) as [number, number, number]
}

function relativeLuminance(hex: string): number {
  const channels = toRgb(hex).map((channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrast(foreground: string, background: string): number {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background))
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background))

  return (light + 0.05) / (dark + 0.05)
}

function value(token: string): string {
  const declared = declarations.get(token)
  if (!declared)
    throw new Error(`тема не объявляет ${token}`)

  return declared
}

/**
 * Производные состояния тема не объявляет — их считает пакет формулой
 * `color-mix(in srgb, <роль> N%, --gr-fg)`. Повторяем формулу, чтобы проверить
 * контраст в hover/active: именно там `-fg` чаще всего и проваливается
 * (ловушка №2 из docs/theming.md).
 */
function mixWithFg(role: string, amount: number): string {
  const base = toRgb(value(role))
  const fg = toRgb(value('--gr-fg'))
  const ratio = amount / 100

  return `#${base
    .map((channel, index) => Math.round(channel * ratio + fg[index] * (1 - ratio)).toString(16).padStart(2, '0'))
    .join('')}`
}

const TONES = ['success', 'warning', 'danger', 'info', 'slate', 'azure'] as const
const AA_TEXT = 4.5
const AA_LARGE = 3

describe('режим ocean', () => {
  it('полнота набора обеспечена композицией, а не перечислением', () => {
    // Все роли в наборе при десятке в конфиге — это и есть наследование от базы.
    const missing = grRoleTokens
      .map(token => token.name)
      .filter(name => !declarations.has(name))

    expect(missing, 'роль, которой нет в режиме, унаследовалась бы из :root — то есть из светлого').toEqual([])
  })

  it('в modes.define уходят только отличия от тёмного режима', () => {
    const dark = resolveModes(slateData as GrThemeData).get('dark')!

    expect(ocean.definition.extends).toBe('dark')
    expect(ocean.definition.colorScheme).toBe('dark')
    for (const [token, value] of Object.entries(ocean.definition.tokens).filter(([token]) => !token.startsWith('gr-button-')))
      expect(value, token).not.toBe(dark[token])
  })

  it('производные состояния посчитаны от цветов ЭТОГО режима', () => {
    // CSS режима для подключения без granum: без своего `@supports` он получил бы фолбэки светлого.
    const fallback = ocean.css.slice(ocean.css.indexOf('@supports'))

    expect(fallback).toContain('[data-theme="slate-ocean"]')
    expect(fallback).toMatch(/--gr-primary-hover:\s*#[\da-f]{6}/i)
  })

  it('основной текст проходит AA на всех поверхностях', () => {
    for (const surface of ['--gr-bg', '--gr-card', '--gr-popover', '--gr-sidebar'])
      expect(contrast(value('--gr-fg'), value(surface)), surface).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('вторичный текст проходит AA на всех своих подложках', () => {
    // Ловушка №1: `--gr-muted-fg` живёт не на фоне страницы.
    for (const surface of ['--gr-bg', '--gr-card', '--gr-muted', '--gr-secondary'])
      expect(contrast(value('--gr-muted-fg'), value(surface)), surface).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('`-fg` читается на своей заливке — включая hover и active', () => {
    const fills = ['--gr-primary', ...TONES.map(tone => `--gr-${tone}`)]

    for (const fill of fills) {
      const fg = value(`${fill}-fg`)

      expect(contrast(fg, value(fill)), `${fill} (база)`).toBeGreaterThanOrEqual(AA_TEXT)
      expect(contrast(fg, mixWithFg(fill, 92)), `${fill} (hover)`).toBeGreaterThanOrEqual(AA_TEXT)
      expect(contrast(fg, mixWithFg(fill, 84)), `${fill} (active)`).toBeGreaterThanOrEqual(AA_TEXT)
    }
  })

  it('`-text` читается на мягкой подложке и на фоне страницы', () => {
    for (const tone of TONES) {
      const text = value(`--gr-${tone}-text`)

      expect(contrast(text, value(`--gr-${tone}-light`)), `${tone} на -light`).toBeGreaterThanOrEqual(AA_TEXT)
      expect(contrast(text, value('--gr-bg')), `${tone} на фоне`).toBeGreaterThanOrEqual(AA_TEXT)
      expect(contrast(text, value('--gr-card')), `${tone} на карточке`).toBeGreaterThanOrEqual(AA_TEXT)
    }
  })

  it('заливка тоном различима как индикатор', () => {
    // Насыщенный тон — это фон и граница, а не текст: с него хватает 3:1.
    for (const tone of TONES)
      expect(contrast(value(`--gr-${tone}`), value('--gr-bg')), tone).toBeGreaterThanOrEqual(AA_LARGE)
  })

  it('focus-ring виден на всех поверхностях', () => {
    for (const surface of ['--gr-bg', '--gr-card', '--gr-muted'])
      expect(contrast(value('--gr-ring'), value(surface)), surface).toBeGreaterThanOrEqual(AA_LARGE)
  })

  it('primary и info различимы между собой', () => {
    // Ловушка №5: два близких тона делают solid-бейджи Primary и Info неотличимыми.
    const [pr, pg, pb] = toRgb(value('--gr-primary'))
    const [ir, ig, ib] = toRgb(value('--gr-info'))
    const distance = Math.sqrt((pr - ir) ** 2 + (pg - ig) ** 2 + (pb - ib) ** 2)

    expect(distance).toBeGreaterThan(40)
  })
})

/**
 * Режим с нуля проверяется тем же способом. Разница в договоре: у `contrast`
 * нет базы, поэтому полнота набора здесь не следствие наследования, а условие
 * сборки (`createMode` падает без неё).
 */
describe('режим contrast', () => {
  const decls = new Map(Object.entries(contrastMode.tokens))
  const read = (token: string): string => {
    const declared = decls.get(token)
    if (!declared) throw new Error(`режим не объявляет ${token}`)

    return declared
  }

  const AAA_TEXT = 7

  it('объявляет все роли сам: ни одна не придёт из `:root`', () => {
    const missing = grRoleTokens.map(token => token.name).filter(name => !decls.has(name))

    expect(missing, 'у режима без базы незаявленная роль приедет из светлого режима пакета').toEqual([])
    expect(Object.keys(contrastMode.definition.tokens)).toHaveLength(grRoleTokens.length)
  })

  it('не заимствует ни одной поверхности у светлого режима пакета', () => {
    // Смысл высококонтрастного режима теряется от любого приглушённого значения,
    // просочившегося из `light`.
    const slateLight = resolveModes(slateData as GrThemeData).get('light')!
    const light = new Map(grRoleTokens.map(token => [token.name, slateLight[token.name.slice(2)]]))

    for (const surface of ['--gr-bg', '--gr-muted', '--gr-secondary', '--gr-brd', '--gr-sidebar'])
      expect(read(surface), surface).not.toBe(light.get(surface))
  })

  it('основной текст держит AAA, а не только AA', () => {
    // Ради этого режим и написан: AA здесь недостаточный порог.
    for (const surface of ['--gr-bg', '--gr-card', '--gr-popover'])
      expect(contrast(read('--gr-fg'), read(surface)), surface).toBeGreaterThanOrEqual(AAA_TEXT)

    expect(contrast(read('--gr-sidebar-fg'), read('--gr-sidebar'))).toBeGreaterThanOrEqual(AAA_TEXT)
  })

  it('текст на solid читается во всех трёх состояниях', () => {
    // Состояния solid — свои роли режима, а не производные формулой: у режима с
    // нуля их некому вывести, и проверить их больше нечем.
    for (const tone of TONES) {
      const fg = read(`--gr-${tone}-solid-fg`)

      for (const state of ['', '-hover', '-active'])
        expect(contrast(fg, read(`--gr-${tone}-solid${state}`)), `${tone}${state}`).toBeGreaterThanOrEqual(AA_TEXT)
    }
  })

  it('производные состояния посчитаны от его собственных цветов', () => {
    const fallback = contrastMode.css.slice(contrastMode.css.indexOf('@supports'))

    expect(fallback).toContain('[data-theme="slate-contrast"]')
    expect(fallback).toMatch(/--gr-primary-hover:\s*#[\da-f]{6}/i)
  })
})

/**
 * Что из этого собрал granum: режимы — под своими парами с токенами
 * компонентов базы, своя тема — полными блоками пар превью и никогда под `:root`.
 */
describe('сборка granum', () => {
  let themes = ''

  beforeAll(async () => {
    const root = fileURLToPath(new URL('../../', import.meta.url))
    themes = (await emitCss(await prepareApp({ ...granumConfig, components: ['@feugene/granularity:GrButton'] }, root))).layers.themes
  }, 60_000)

  const block = (selector: string): Map<string, string> => {
    const bodies = [...themes.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter(([, head]) => head!.split(',').map(part => part.trim()).includes(selector))
      .map(([, , body]) => body!)
    return parseDeclarations(bodies.join('\n'))
  }

  it('ocean и contrast — под парами slate; токены кнопки ocean — свои, поверх тёмного режима', () => {
    expect(block('[data-theme="slate-ocean"]').get('--gr-primary')).toBe(ocean.tokens['--gr-primary'])
    expect(block('[data-theme="slate-ocean"]').get('--gr-button-primary-bg')).toBe('var(--gr-primary)')
    expect(block('[data-theme="slate-contrast"]').get('--gr-bg')).toBe('#ffffff')
  })

  it('brand — превью: блоки обеих пар, примитивы темы в них, под :root не выходит', () => {
    const light = block('[data-theme="brand-light"]')

    expect(light.get('--gr-primary')).toBe('#0f766e')
    expect(light.get('--gr-radius-md')).toBe('10px')
    expect(block('[data-theme="brand-dark"]').get('--gr-primary')).toBe('#5eead4')
    expect(themes).not.toContain(':root, [data-theme="brand-')
  })

  it('brand наследует токены компонентов «Сланца» по цепочке extends', () => {
    // Токены кнопки по темам объявлены только для `slate`: без `extends` в теме
    // приложения превью осталось бы с одними фолбэками компонента.
    expect([...block('[data-theme="brand-dark"]').keys()].some(token => token.startsWith('--gr-button-'))).toBe(true)
  })
})
