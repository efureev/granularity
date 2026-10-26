import { grDerivedTokens } from '@feugene/granularity-tokens'
import { contrast, deltaE, luminance, parseHex, type Rgb } from '@feugene/granularity-tokens/theme'

import { componentThemeVars, THEME_MODES as CONTEXTS, type ThemeMode, themeVars } from './themeCss'

export type { ThemeMode }
/** Ключ контекста гейта — пара «тема-режим» (`slate-dark`). */
export type GrModeName = string

/** Контексты гейтов: каждая тема каталога в каждом своём режиме. */
export const THEME_MODE_CONTEXTS: readonly ThemeMode[] = CONTEXTS

/** Ключи контекстов — пары `<тема>-<режим>`; по ним индексированы все карты ниже. */
export const THEME_MODES: readonly GrModeName[] = CONTEXTS.map(context => context.key)

/** Ключи контекстов с данной схемой — для проверок, зависящих от светлого или тёмного фона. */
export function themeModesOfScheme(scheme: ThemeMode['colorScheme']): GrModeName[] {
  return CONTEXTS.filter(context => context.colorScheme === scheme).map(context => context.key)
}

/**
 * Разрешение CSS-цветов и расчёт контраста для тестов.
 *
 * Зачем: jsdom не подставляет `var()` и не умеет `color-mix()`, поэтому проверить
 * «что реально увидит пользователь» через `getComputedStyle` нельзя. Здесь
 * тема читается данными, `var()`/`color-mix()` разворачиваются вручную, и
 * контраст считается по формуле WCAG. Это позволяет держать AA-гарантию в
 * юнит-тестах, а не только в axe поверх собранной витрины.
 */

export type RgbColor = {
  r: number
  g: number
  b: number
}

/** Разбивает по запятым верхнего уровня, не залезая внутрь скобок. */
function splitTopLevel(input: string): string[] {
  const parts: string[] = []
  let buffer = ''
  let depth = 0

  for (const char of input) {
    if (char === ',' && depth === 0) {
      parts.push(buffer.trim())
      buffer = ''
      continue
    }

    if (char === '(')
      depth += 1
    if (char === ')')
      depth -= 1
    buffer += char
  }

  if (buffer.trim())
    parts.push(buffer.trim())

  return parts
}

/**
 * Цвет здесь — тройка каналов, а математика общая с темами (`@feugene/granularity-tokens/theme`):
 * контраст, ΔE и подмес обязаны считаться одинаково у гейтов, у генератора
 * токенов и у `extendMode`, иначе «проверено» и «сгенерировано» разъедутся.
 */
function hexToRgb(hex: string): RgbColor {
  const [r, g, b] = parseHex(hex)

  return { r, g, b }
}

function mixColors(left: RgbColor, right: RgbColor, leftAmount: number): RgbColor {
  return {
    r: left.r * leftAmount + right.r * (1 - leftAmount),
    g: left.g * leftAmount + right.g * (1 - leftAmount),
    b: left.b * leftAmount + right.b * (1 - leftAmount),
  }
}

const channelsOf = (color: RgbColor): Rgb => [color.r, color.g, color.b]

export function getLuminance(color: RgbColor): number {
  return luminance(channelsOf(color))
}

export function getContrastRatio(foreground: RgbColor, background: RgbColor): number {
  return contrast(channelsOf(foreground), channelsOf(background))
}

export function getColorDistance(first: RgbColor, second: RgbColor): number {
  return deltaE(channelsOf(first), channelsOf(second))
}

/**
 * Разворачивает CSS-выражение цвета в RGB: `var()` (с фолбэками и защитой от
 * циклов), `color-mix(in srgb, A p%, B)`, hex и `transparent` (трактуется как
 * фон страницы — под кнопкой/бейджем всегда он).
 */
export function resolveColorExpression(
  expression: string,
  vars: Record<string, string>,
  derivedVars: Record<string, string>,
  stack: string[] = [],
): RgbColor {
  const value = expression.trim()

  if (value === 'transparent') {
    return resolveColorExpression('var(--gr-bg)', vars, derivedVars, stack)
  }

  if (value.startsWith('var(')) {
    const [key, fallback] = splitTopLevel(value.slice(4, -1))

    if (stack.includes(key)) {
      throw new Error(`Circular var() reference: ${[...stack, key].join(' -> ')}`)
    }

    const resolved = vars[key] ?? derivedVars[key] ?? fallback

    if (!resolved) {
      throw new Error(`Unknown CSS var: ${key}`)
    }

    return resolveColorExpression(resolved, vars, derivedVars, [...stack, key])
  }

  if (value.startsWith('color-mix(')) {
    const [space, left, right] = splitTopLevel(value.slice('color-mix('.length, -1))
    // Доля — число или токен темы с числом (`var(--gr-badge-light-brd)`): тема
    // задаёт, сколько тона идёт в слой, одной ручкой на все тона.
    const leftMatch = left.match(/^(.+?)\s+(\d+%|var\(--[\w-]+\))$/)
    const share = leftMatch?.[2].startsWith('var(')
      ? vars[leftMatch[2].slice(4, -1)] ?? derivedVars[leftMatch[2].slice(4, -1)]
      : leftMatch?.[2]

    if (space !== 'in srgb' || !leftMatch || !share || !/^\d+%$/.test(share)) {
      throw new Error(`Unsupported color-mix() expression: ${value}`)
    }

    return mixColors(
      resolveColorExpression(leftMatch[1], vars, derivedVars, stack),
      resolveColorExpression(right, vars, derivedVars, stack),
      Number.parseInt(share, 10) / 100,
    )
  }

  if (value.startsWith('#')) {
    return hexToRgb(value)
  }

  throw new Error(`Unsupported color expression: ${value}`)
}

/**
 * Достаёт выражение цвета из utility-класса вида `text-[…]` / `hover:bg-[…]`.
 * `<prefix>transparent` (без скобок) распознаётся отдельно.
 *
 * Подчёркивания разворачиваются обратно в пробелы: в arbitrary-значениях UnoCSS
 * `_` — это escape пробела (`color-mix(in_srgb,var(--gr-x)_30%,…)`). Имена
 * CSS-переменных подчёркиваний не содержат, так что замена безопасна.
 */
export function getColorClassExpression(className: string, prefix: string): string | undefined {
  const transparentToken = `${prefix}transparent`

  if (className.includes(transparentToken))
    return 'transparent'

  // `text-[` — префикс не только цвета: кегль из токена приезжает как
  // `text-[length:var(--gr-text-sm)]` и в шкале классов стоит раньше цвета.
  for (let start = className.indexOf(prefix); start !== -1; start = className.indexOf(prefix, start + 1)) {
    const valueStart = start + prefix.length
    const valueEnd = className.indexOf(']', valueStart)

    if (valueEnd === -1)
      return undefined

    const value = className.slice(valueStart, valueEnd).replace(/_/g, ' ')

    if (!value.startsWith('length:'))
      return value
  }

  return undefined
}

/** Примитивы и роли каждой темы в каждом режиме — из данных пакета токенов. */
export const themeVarsByName = Object.fromEntries(THEME_MODES.map(key => [key, themeVars(key)])) as Record<GrModeName, Record<string, string>>

/** Производные формулы (`--gr-primary-hover` и т.п.) — из реестра пакета токенов. */
export const derivedThemeVars: Record<string, string> = Object.fromEntries(grDerivedTokens.map(token => [token.name, token.formula]))

/** Токены компонента в режиме темы — раздел `components` данных темы, по правилу granum. */
export function readComponentThemeVars(component: string, key: GrModeName): Record<string, string> {
  return componentThemeVars(component, key)
}
