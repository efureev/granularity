import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import GrButton from '../GrButton.vue'
import { grButtonClass, type GrButtonTone, type GrButtonVariant } from '../grButtonStyles'
import {
  derivedThemeVars,
  getColorClassExpression,
  getContrastRatio,
  getLuminance,
  readComponentThemeVars,
  resolveColorExpression,
  themeVarsByName,
} from '../../../__tests__/cssContrast'

const lightThemeVars = themeVarsByName.light
const darkThemeVars = themeVarsByName.dark
const grButtonLightThemeVars = readComponentThemeVars('GrButton', 'light')
const grButtonDarkThemeVars = readComponentThemeVars('GrButton', 'dark')
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
  const restBackground = getColorClassExpression(className, 'bg-[') ?? getColorClassExpression(className, 'bg-') ?? 'var(--gr-bg)'

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

    const button = wrapper.get('[data-gr-button]')

    expect(button.attributes('data-gr-variant')).toBe('primary')
    expect(button.attributes('data-gr-tone')).toBe('primary')
    expect(button.classes()).toContain('bg-[var(--gr-button-primary-bg,var(--gr-primary))]')
    expect(button.classes()).toContain('text-[var(--gr-button-primary-fg,var(--gr-primary-fg))]')
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

    const button = wrapper.get('[data-gr-button]')

    expect(button.attributes('data-gr-variant')).toBe('primary')
    expect(button.attributes('data-gr-tone')).toBe('success')
    expect(button.classes()).toContain('bg-[var(--gr-button-success-bg,var(--gr-success))]')
    expect(button.classes()).toContain('text-[var(--gr-button-success-fg,var(--gr-success-fg,var(--gr-fg)))]')
    expect(button.classes()).toContain('hover:bg-[var(--gr-button-success-bg-hover,var(--gr-success-hover))]')
    expect(button.classes()).toContain('active:bg-[var(--gr-button-success-bg-active,var(--gr-success-active))]')
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

    const button = wrapper.get('[data-gr-button]')
    const className = button.attributes('class') ?? ''

    expect(button.attributes('data-gr-variant')).toBe('outline')
    expect(button.attributes('data-gr-tone')).toBe('warning')
    expect(button.classes()).toContain('text-[var(--gr-warning-text,var(--gr-warning))]')
    expect(button.classes()).toContain('border-[var(--gr-warning)]')
    expect(className).toContain('hover:bg-[var(--gr-button-warning-soft-bg-hover)]')
    expect(className).toContain('active:bg-[var(--gr-button-warning-soft-bg-active)]')
    expect(className).toContain('hover:active:bg-[var(--gr-button-warning-soft-bg-active)]')
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
    }).get('[data-gr-button]')

    const azure = mount(GrButton, {
      props: {
        variant: 'ghost-border',
        tone: 'azure',
      },
      slots: {
        default: 'Details',
      },
    }).get('[data-gr-button]')

    expect(slate.attributes('data-gr-tone')).toBe('slate')
    expect(slate.classes()).toContain('bg-[var(--gr-button-slate-bg,var(--gr-slate))]')
    expect(slate.classes()).toContain('text-[var(--gr-button-slate-fg,var(--gr-slate-fg,var(--gr-fg)))]')
    expect(slate.classes()).toContain('hover:bg-[var(--gr-button-slate-bg-hover,var(--gr-slate-hover))]')

    const azureClassName = azure.attributes('class') ?? ''
    expect(azure.attributes('data-gr-tone')).toBe('azure')
    expect(azure.classes()).toContain('text-[var(--gr-azure-text,var(--gr-azure))]')
    expect(azureClassName).toContain('hover:bg-[var(--gr-button-azure-soft-bg-hover)]')
    expect(azureClassName).toContain('hover:active:border-[var(--gr-azure-active)]')
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

    expect(filled).toContain('hover:active:bg-[var(--gr-button-info-bg-active,var(--gr-info-active))]')
    expect(filled).toContain('hover:active:border-[var(--gr-button-info-bg-active,var(--gr-info-active))]')

    expect(ghost).toContain('hover:bg-[var(--gr-button-info-soft-bg-hover)]')
    expect(ghost).toContain('active:bg-[var(--gr-button-info-soft-bg-active)]')
    expect(ghost).toContain('hover:active:bg-[var(--gr-button-info-soft-bg-active)]')

    expect(ghostBorder).toContain('hover:active:bg-[var(--gr-button-success-soft-bg-active)]')
    expect(ghostBorder).toContain('hover:active:border-[var(--gr-success-active)]')
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

  it('loading: aria-disabled + aria-busy, но БЕЗ нативного disabled (фокус сохраняется)', () => {
    const wrapper = mount(GrButton, { props: { loading: true }, slots: { default: 'Save' } })
    const button = wrapper.get('[data-gr-button]')

    expect(button.attributes('aria-busy')).toBe('true')
    expect(button.attributes('aria-disabled')).toBe('true')
    // Нативный disabled НЕ выставлен — элемент остаётся фокусируемым.
    expect(button.attributes('disabled')).toBeUndefined()
    expect((button.element as HTMLButtonElement).disabled).toBe(false)
  })

  it('explicit disabled: нативный disabled на <button>', () => {
    const wrapper = mount(GrButton, { props: { disabled: true }, slots: { default: 'Save' } })
    expect((wrapper.get('[data-gr-button]').element as HTMLButtonElement).disabled).toBe(true)
  })

  it('loading блокирует клик, сохраняя элемент интерактивным по фокусу', async () => {
    const onClick = vi.fn()
    const wrapper = mount(GrButton, {
      props: { loading: true },
      attrs: { onClick },
      slots: { default: 'Save' },
    })

    await wrapper.get('[data-gr-button]').trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('полиморфизм: рендерится как <a> при href (с target/rel)', () => {
    const wrapper = mount(GrButton, {
      props: { href: 'https://example.com', external: true },
      slots: { default: 'Docs' },
    })
    const el = wrapper.get('[data-gr-button]')
    expect(el.element.tagName.toLowerCase()).toBe('a')
    expect(el.attributes('href')).toBe('https://example.com')
    expect(el.attributes('target')).toBe('_blank')
    expect(el.attributes('rel')).toBe('noopener noreferrer')
  })
})