import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrButton from '../GrButton.vue'
import { grButtonClass, type GrButtonTone, type GrButtonVariant } from '../grButtonStyles'

type RgbColor = {
  r: number
  g: number
  b: number
}

function parseVars(content: string): Record<string, string> {
  return Object.fromEntries(
    [...content.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, key, value]) => [`--${key}`, value.trim()]),
  )
}

function extractCssBlock(content: string, selector: string): string {
  const start = content.indexOf(selector)

  if (start === -1) {
    throw new Error(`CSS block not found for selector: ${selector}`)
  }

  const openBrace = content.indexOf('{', start)

  if (openBrace === -1) {
    throw new Error(`CSS block has no opening brace: ${selector}`)
  }

  let depth = 0

  for (let index = openBrace; index < content.length; index += 1) {
    if (content[index] === '{') depth += 1
    if (content[index] === '}') depth -= 1

    if (depth === 0) {
      return content.slice(openBrace + 1, index)
    }
  }

  throw new Error(`CSS block has no closing brace: ${selector}`)
}

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

    if (char === '(') depth += 1
    if (char === ')') depth -= 1
    buffer += char
  }

  if (buffer.trim()) parts.push(buffer.trim())

  return parts
}

function hexToRgb(hex: string): RgbColor {
  let value = hex.trim().slice(1)

  if (value.length === 3) {
    value = value.split('').map(char => char + char).join('')
  }

  const numeric = Number.parseInt(value, 16)

  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  }
}

function mixColors(left: RgbColor, right: RgbColor, leftAmount: number): RgbColor {
  return {
    r: left.r * leftAmount + right.r * (1 - leftAmount),
    g: left.g * leftAmount + right.g * (1 - leftAmount),
    b: left.b * leftAmount + right.b * (1 - leftAmount),
  }
}

function resolveColorExpression(
  expression: string,
  vars: Record<string, string>,
  derivedVars: Record<string, string>,
  stack: string[] = [],
): RgbColor {
  const value = expression.trim()

  if (value === 'transparent') {
    return resolveColorExpression('var(--bg)', vars, derivedVars, stack)
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
    const leftMatch = left.match(/^(.+?)\s+(\d+)%$/)

    if (space !== 'in srgb' || !leftMatch) {
      throw new Error(`Unsupported color-mix() expression: ${value}`)
    }

    return mixColors(
      resolveColorExpression(leftMatch[1], vars, derivedVars, stack),
      resolveColorExpression(right, vars, derivedVars, stack),
      Number.parseInt(leftMatch[2], 10) / 100,
    )
  }

  if (value.startsWith('#')) {
    return hexToRgb(value)
  }

  throw new Error(`Unsupported color expression: ${value}`)
}

function getLuminance(color: RgbColor): number {
  const [red, green, blue] = [color.r, color.g, color.b].map(channel => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function getContrastRatio(foreground: RgbColor, background: RgbColor): number {
  const first = getLuminance(foreground)
  const second = getLuminance(background)
  const [lighter, darker] = first > second ? [first, second] : [second, first]

  return (lighter + 0.05) / (darker + 0.05)
}

function getColorClassExpression(className: string, prefix: string): string | undefined {
  const transparentToken = `${prefix}transparent`

  if (className.includes(transparentToken)) return 'transparent'

  const start = className.indexOf(prefix)

  if (start === -1) return undefined

  const valueStart = start + prefix.length
  const valueEnd = className.indexOf(']', valueStart)

  if (valueEnd === -1) return undefined

  return className.slice(valueStart, valueEnd)
}

const lightThemeContent = readFileSync(resolve(process.cwd(), 'src/styles/themes/light.css'), 'utf8')
const darkThemeContent = readFileSync(resolve(process.cwd(), 'src/styles/themes/dark.css'), 'utf8')
const grButtonLightThemeContent = readFileSync(resolve(process.cwd(), 'src/components/GrButton/themes/light.css'), 'utf8')
const grButtonDarkThemeContent = readFileSync(resolve(process.cwd(), 'src/components/GrButton/themes/dark.css'), 'utf8')
const lightThemeVars = parseVars(lightThemeContent)
const darkThemeVars = parseVars(darkThemeContent)
const derivedThemeVars = parseVars(readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8'))
const grButtonLightThemeVars = parseVars(extractCssBlock(grButtonLightThemeContent, ':root'))
const grButtonDarkThemeVars = parseVars(extractCssBlock(grButtonDarkThemeContent, '.theme-dark,'))
const variants: GrButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'ghost-border']
const tones: GrButtonTone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info', 'slate', 'azure']
const filledTones: GrButtonTone[] = ['primary', 'success', 'warning', 'danger', 'info', 'slate', 'azure']
const states = ['rest', 'hover', 'active'] as const

function getButtonColors(variant: GrButtonVariant, tone: GrButtonTone, state: (typeof states)[number]) {
  const className = grButtonClass({
    variant,
    tone,
    size: 'md',
    square: false,
  })

  const text = getColorClassExpression(className, 'text-[')
  const restBackground = getColorClassExpression(className, 'bg-[') ?? getColorClassExpression(className, 'bg-') ?? 'var(--bg)'

  if (!text) {
    throw new Error(`Missing text color class for ${variant}/${tone}`)
  }

  if (state === 'rest') {
    return {
      text,
      background: restBackground,
    }
  }

  return {
    text,
    background:
      getColorClassExpression(className, `${state}:bg-[`) ??
      getColorClassExpression(className, `${state}:bg-`) ??
      restBackground,
  }
}

describe('GrButton', () => {
  it('по умолчанию рендерит filled primary tone и прокидывает data-атрибуты', () => {
    const wrapper = mount(GrButton, {
      slots: {
        default: 'Save',
      },
    })

    const button = wrapper.get('[data-ds-button]')

    expect(button.attributes('data-ds-variant')).toBe('primary')
    expect(button.attributes('data-ds-tone')).toBe('primary')
    expect(button.classes()).toContain('bg-[var(--ds-button-primary-bg,var(--primary))]')
    expect(button.classes()).toContain('text-[var(--ds-button-primary-fg,var(--primary-fg))]')
  })

  it('поддерживает semantic tone для filled tone', () => {
    const wrapper = mount(GrButton, {
      props: {
        variant: 'primary',
        tone: 'success',
      },
      slots: {
        default: 'Complete',
      },
    })

    const button = wrapper.get('[data-ds-button]')

    expect(button.attributes('data-ds-variant')).toBe('primary')
    expect(button.attributes('data-ds-tone')).toBe('success')
    expect(button.classes()).toContain('bg-[var(--ds-button-success-bg,var(--ds-success))]')
    expect(button.classes()).toContain('text-[var(--ds-button-success-fg,var(--ds-success-fg,var(--fg)))]')
    expect(button.classes()).toContain('hover:bg-[var(--ds-button-success-bg-hover,var(--ds-success-hover))]')
    expect(button.classes()).toContain('active:bg-[var(--ds-button-success-bg-active,var(--ds-success-active))]')
  })

  it('поддерживает tone-aware outline tone', () => {
    const wrapper = mount(GrButton, {
      props: {
        variant: 'outline',
        tone: 'warning',
      },
      slots: {
        default: 'Review',
      },
    })

    const button = wrapper.get('[data-ds-button]')
    const className = button.attributes('class') ?? ''

    expect(button.attributes('data-ds-variant')).toBe('outline')
    expect(button.attributes('data-ds-tone')).toBe('warning')
    expect(button.classes()).toContain('text-[var(--ds-warning-text,var(--ds-warning))]')
    expect(button.classes()).toContain('border-[var(--ds-warning)]')
    expect(className).toContain('hover:bg-[var(--ds-button-warning-soft-bg-hover)]')
    expect(className).toContain('active:bg-[var(--ds-button-warning-soft-bg-active)]')
    expect(className).toContain('hover:active:bg-[var(--ds-button-warning-soft-bg-active)]')
  })

  it('поддерживает новые semantic tones slate и azure', () => {
    const slate = mount(GrButton, {
      props: {
        variant: 'primary',
        tone: 'slate',
      },
      slots: {
        default: 'Archive',
      },
    }).get('[data-ds-button]')

    const azure = mount(GrButton, {
      props: {
        variant: 'ghost-border',
        tone: 'azure',
      },
      slots: {
        default: 'Details',
      },
    }).get('[data-ds-button]')

    expect(slate.attributes('data-ds-tone')).toBe('slate')
    expect(slate.classes()).toContain('bg-[var(--ds-button-slate-bg,var(--ds-slate))]')
    expect(slate.classes()).toContain('text-[var(--ds-button-slate-fg,var(--ds-slate-fg,var(--fg)))]')
    expect(slate.classes()).toContain('hover:bg-[var(--ds-button-slate-bg-hover,var(--ds-slate-hover))]')

    const azureClassName = azure.attributes('class') ?? ''
    expect(azure.attributes('data-ds-tone')).toBe('azure')
    expect(azure.classes()).toContain('text-[var(--ds-azure-text,var(--ds-azure))]')
    expect(azureClassName).toContain('hover:bg-[var(--ds-button-azure-soft-bg-hover)]')
    expect(azureClassName).toContain('hover:active:border-[var(--ds-azure-active)]')
  })

  it('добавляет hover:active правила, чтобы pressed-состояние не терялось под hover', () => {
    const filled = grButtonClass({
      variant: 'primary',
      tone: 'info',
      size: 'md',
      square: false,
    })
    const ghost = grButtonClass({
      variant: 'ghost',
      tone: 'info',
      size: 'md',
      square: false,
    })
    const ghostBorder = grButtonClass({
      variant: 'ghost-border',
      tone: 'success',
      size: 'md',
      square: false,
    })

    expect(filled).toContain('hover:active:bg-[var(--ds-button-info-bg-active,var(--ds-info-active))]')
    expect(filled).toContain('hover:active:border-[var(--ds-button-info-bg-active,var(--ds-info-active))]')

    expect(ghost).toContain('hover:bg-[var(--ds-button-info-soft-bg-hover)]')
    expect(ghost).toContain('active:bg-[var(--ds-button-info-soft-bg-active)]')
    expect(ghost).toContain('hover:active:bg-[var(--ds-button-info-soft-bg-active)]')

    expect(ghostBorder).toContain('hover:active:bg-[var(--ds-button-success-soft-bg-active)]')
    expect(ghostBorder).toContain('hover:active:border-[var(--ds-success-active)]')
  })

  it('в light theme filled success, warning, slate и azure кнопки используют светлый foreground с достаточным контрастом', () => {
    const failures: string[] = []

    for (const tone of ['success', 'warning', 'slate', 'azure'] as const) {
      for (const state of states) {
        const colors = getButtonColors('primary', tone, state)
        const text = resolveColorExpression(colors.text, { ...lightThemeVars, ...grButtonLightThemeVars }, derivedThemeVars)
        const background = resolveColorExpression(colors.background, { ...lightThemeVars, ...grButtonLightThemeVars }, derivedThemeVars)
        const contrast = getContrastRatio(text, background)

        if (getLuminance(text) <= getLuminance(background) || contrast < 4.5) {
          failures.push(`${tone}:${state}:${contrast.toFixed(2)}`)
        }
      }
    }

    expect(failures).toEqual([])
  })

  it('в dark theme filled-кнопки используют светлый foreground для primary и semantic tones', () => {
    const failures: string[] = []

    for (const tone of filledTones) {
      for (const state of states) {
        const colors = getButtonColors('primary', tone, state)
        const text = resolveColorExpression(colors.text, { ...darkThemeVars, ...grButtonDarkThemeVars }, derivedThemeVars)
        const background = resolveColorExpression(colors.background, { ...darkThemeVars, ...grButtonDarkThemeVars }, derivedThemeVars)

        if (getLuminance(text) <= getLuminance(background)) {
          failures.push(`${tone}:${state}`)
        }
      }
    }

    expect(failures).toEqual([])
  })

  it('сохраняет достаточный контраст текста и заливки для всех tone × tone в light и dark темах', () => {
    const failures: string[] = []

    for (const [themeName, themeVars] of Object.entries({
      light: { ...lightThemeVars, ...grButtonLightThemeVars },
      dark: { ...darkThemeVars, ...grButtonLightThemeVars, ...grButtonDarkThemeVars },
    })) {
      for (const variant of variants) {
        for (const tone of tones) {
          for (const state of states) {
            const colors = getButtonColors(variant, tone, state)
            const contrast = getContrastRatio(
              resolveColorExpression(colors.text, themeVars, derivedThemeVars),
              resolveColorExpression(colors.background, themeVars, derivedThemeVars),
            )

            if (contrast < 4.5) {
              failures.push(`${themeName}:${variant}:${tone}:${state}:${contrast.toFixed(2)}`)
            }
          }
        }
      }
    }

    expect(failures).toEqual([])
  })
})