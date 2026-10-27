import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrIcon from '../../GrIcon/GrIcon.vue'
import GrButtonGroup from '../../GrButtonGroup/GrButtonGroup.vue'
import GrButton from '../GrButton.vue'
import { grButtonClass, type GrButtonTone, type GrButtonVariant } from '../grButtonStyles'
import {
  derivedThemeVars,
  getColorClassExpression,
  getContrastRatio,
  getLuminance,
  readComponentThemeVars,
  resolveColorExpression,
  THEME_MODES,
  themeModesOfScheme,
  themeVarsByName,
} from '../../../__tests__/cssContrast'

/** Роли режима и токены кнопки поверх — то, что видит кнопка в этом режиме темы. */
const buttonVarsOf = (key: string) => ({ ...themeVarsByName[key], ...readComponentThemeVars('GrButton', key) })

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
    disabled: false,
    block: false,
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
      getColorClassExpression(className, `${state}:bg-[`)
      ?? getColorClassExpression(className, `${state}:bg-`)
      ?? restBackground,
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
    expect(button.classes()).toContain('bg-[var(--gr-button-primary-bg)]')
    expect(button.classes()).toContain('text-[var(--gr-button-primary-fg)]')
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
    expect(button.classes()).toContain('bg-[var(--gr-button-success-bg)]')
    expect(button.classes()).toContain('text-[var(--gr-button-success-fg)]')
    expect(button.classes()).toContain('hover:bg-[var(--gr-button-success-bg-hover)]')
    expect(button.classes()).toContain('active:bg-[var(--gr-button-success-bg-active)]')
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
    expect(button.classes()).toContain('text-[var(--gr-warning-text)]')
    expect(button.classes()).toContain('border-[var(--gr-button-warning-border)]')
    expect(className).toContain('hover:border-[var(--gr-button-warning-border-hover)]')
    expect(className).toContain('hover:bg-[var(--gr-button-ghost-bg-hover,var(--gr-button-warning-ghost-bg-hover))]')
    expect(className).toContain('active:bg-[var(--gr-button-ghost-bg-active,var(--gr-button-warning-ghost-bg-active))]')
    expect(className).toContain('hover:active:bg-[var(--gr-button-ghost-bg-active,var(--gr-button-warning-ghost-bg-active))]')
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
    expect(slate.classes()).toContain('bg-[var(--gr-button-slate-bg)]')
    expect(slate.classes()).toContain('text-[var(--gr-button-slate-fg)]')
    expect(slate.classes()).toContain('hover:bg-[var(--gr-button-slate-bg-hover)]')

    const azureClassName = azure.attributes('class') ?? ''
    expect(azure.attributes('data-gr-tone')).toBe('azure')
    expect(azure.classes()).toContain('text-[var(--gr-azure-text)]')
    expect(azureClassName).toContain('hover:bg-[var(--gr-button-ghost-bg-hover,var(--gr-button-azure-ghost-bg-hover))]')
    expect(azureClassName).toContain('hover:active:border-[var(--gr-button-azure-border-active)]')
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

    expect(filled).toContain('hover:active:bg-[var(--gr-button-info-bg-active)]')
    expect(filled).toContain('hover:active:border-[var(--gr-button-info-bg-active)]')

    expect(ghost).toContain('hover:bg-[var(--gr-button-ghost-bg-hover,var(--gr-button-info-ghost-bg-hover))]')
    expect(ghost).toContain('active:bg-[var(--gr-button-ghost-bg-active,var(--gr-button-info-ghost-bg-active))]')
    expect(ghost).toContain('hover:active:bg-[var(--gr-button-ghost-bg-active,var(--gr-button-info-ghost-bg-active))]')

    expect(ghostBorder).toContain('hover:active:bg-[var(--gr-button-ghost-bg-active,var(--gr-button-success-ghost-bg-active))]')
    expect(ghostBorder).toContain('hover:active:border-[var(--gr-button-success-border-active)]')
  })

  // Светлая подпись на заливке — выбор «Сланца», а не свойство кнопки: у «Глины»
  // светлые земляные тона несут графитовую подпись. Контраст любой темы держит
  // тест «tone × tone» ниже.
  it('у «Сланца» в светлом режиме filled success, warning, slate и azure кнопки используют светлый foreground с достаточным контрастом', () => {
    const failures: string[] = []

    for (const key of themeModesOfScheme('light').filter(mode => mode.startsWith('slate-'))) {
      for (const tone of ['success', 'warning', 'slate', 'azure'] as const) {
        for (const state of states) {
          const colors = getButtonColors('primary', tone, state)
          const text = resolveColorExpression(colors.text, buttonVarsOf(key), derivedThemeVars)
          const background = resolveColorExpression(colors.background, buttonVarsOf(key), derivedThemeVars)
          const contrast = getContrastRatio(text, background)

          if (getLuminance(text) <= getLuminance(background) || contrast < 4.5) {
            failures.push(`${key}:${tone}:${state}:${contrast.toFixed(2)}`)
          }
        }
      }
    }

    expect(failures).toEqual([])
  })

  it('у «Сланца» в тёмном режиме filled-кнопки используют светлый foreground для primary и semantic tones', () => {
    const failures: string[] = []

    for (const key of themeModesOfScheme('dark').filter(mode => mode.startsWith('slate-'))) {
      for (const tone of filledTones) {
        for (const state of states) {
          const colors = getButtonColors('primary', tone, state)
          const text = resolveColorExpression(colors.text, buttonVarsOf(key), derivedThemeVars)
          const background = resolveColorExpression(colors.background, buttonVarsOf(key), derivedThemeVars)

          if (getLuminance(text) <= getLuminance(background)) {
            failures.push(`${key}:${tone}:${state}`)
          }
        }
      }
    }

    expect(failures).toEqual([])
  })

  // Правило «Глины»: залитая кнопка под указателем уходит прочь от цвета подписи —
  // под графитовой светлеет, под светлой темнеет, — и контраст только растёт.
  // Исключение — главная кнопка `neutral`: её заливка — край шкалы (графит в
  // светлом режиме, бумага в тёмном), дальше от подписи заметного шага нет, и она
  // уходит к середине, держа подпись не ниже AAA.
  it('у «Глины» наведение и нажатие filled-кнопки не снижают контраст подписи', () => {
    const failures: string[] = []

    for (const key of THEME_MODES.filter(mode => mode.startsWith('clay-'))) {
      for (const tone of tones) {
        const ratioOf = (state: (typeof states)[number]) => {
          const colors = getButtonColors('primary', tone, state)
          return getContrastRatio(
            resolveColorExpression(colors.text, buttonVarsOf(key), derivedThemeVars),
            resolveColorExpression(colors.background, buttonVarsOf(key), derivedThemeVars),
          )
        }
        const floor = tone === 'neutral' ? 7 : ratioOf('rest')
        for (const state of ['hover', 'active'] as const) {
          if (ratioOf(state) < floor)
            failures.push(`${key}:${tone}:${state}: ${ratioOf(state).toFixed(2)} < ${floor.toFixed(2)}`)
        }
      }
    }

    expect(THEME_MODES.some(mode => mode.startsWith('clay-'))).toBe(true)
    expect(failures).toEqual([])
  })

  // Блик поверх заливки («Тактильная») светлее всего у верхней кромки: подпись
  // обязана держать AA и там, а не только на чистой заливке.
  it('подпись solid-кнопки держит контраст и под бликом заливки', () => {
    const failures: string[] = []
    const glossed = THEME_MODES.filter(key => buttonVarsOf(key)['--gr-button-solid-image'] !== 'none')

    for (const key of glossed) {
      const vars = buttonVarsOf(key)
      const stop = /color-mix\(in srgb, (.+?) (\d+)%, transparent\)/.exec(vars['--gr-button-solid-image'])
      if (!stop) {
        failures.push(`${key}: первая точка блика не разобрана — ${vars['--gr-button-solid-image']}`)
        continue
      }
      for (const tone of tones) {
        for (const state of states) {
          const colors = getButtonColors('primary', tone, state)
          const text = resolveColorExpression(colors.text, vars, derivedThemeVars)
          const top = resolveColorExpression(`color-mix(in srgb, ${stop[1]} ${stop[2]}%, ${colors.background})`, vars, derivedThemeVars)
          const ratio = getContrastRatio(text, top)
          if (ratio < 4.5)
            failures.push(`${key}:${tone}:${state}:${ratio.toFixed(2)}`)
        }
      }
    }

    expect(glossed.length).toBeGreaterThan(0)
    expect(failures).toEqual([])
  })

  it('сохраняет достаточный контраст текста и заливки для всех tone × tone в каждом режиме каждой темы', () => {
    const failures: string[] = []

    for (const [themeName, themeVars] of THEME_MODES.map(key => [key, buttonVarsOf(key)] as const)) {
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

describe('GrButton — отключённое состояние', () => {
  // `opacity` разбавляет выверенные на AA цвета, а кнопка чаще всего стоит на
  // цветной подложке — там разбавленный текст проваливается первым.
  it('гасится токенами, а не прозрачностью', () => {
    const wrapper = mount(GrButton, { props: { disabled: true }, slots: { default: 'Save' } })
    const classes = wrapper.get('[data-gr-button]').classes()

    expect(classes).toContain('bg-[var(--gr-button-disabled-bg)]')
    expect(classes).toContain('text-[var(--gr-button-disabled-fg)]')
    expect(classes.some(cls => cls.includes('opacity-'))).toBe(false)
  })

  // Кнопка, недоступная для скринридера, не может выглядеть доступной. Так
  // держит перенос без пути `GrTransfer`: в фокусе, но объявлен недоступным.
  it('`aria-disabled="true"` снаружи даёт вид отключённой, но не нативный `disabled`', () => {
    const wrapper = mount(GrButton, {
      props: { variant: 'secondary' },
      attrs: { 'aria-disabled': 'true' },
      slots: { default: 'Move' },
    })
    const button = wrapper.get('[data-gr-button]')

    expect(button.classes()).toContain('bg-[var(--gr-button-disabled-bg)]')
    expect(button.classes()).toContain('text-[var(--gr-button-disabled-fg)]')
    expect((button.element as HTMLButtonElement).disabled).toBe(false)
  })

  it('`aria-disabled="false"` вид не трогает', () => {
    const wrapper = mount(GrButton, { attrs: { 'aria-disabled': 'false' }, slots: { default: 'Move' } })

    expect(wrapper.get('[data-gr-button]').classes()).not.toContain('bg-[var(--gr-button-disabled-bg)]')
  })

  /**
   * Токены кнопки — ссылки на общие роли недоступного состояния, те же, что у
   * вкладки, сегмента и бегунка. Разъехаться это может молча: классы в разметке
   * не меняются, меняется только то, во что разворачивается `var()`.
   *
   * Раньше здесь стоял порог контраста 4.5 — единственное место в пакете, где
   * недоступное состояние обязано было оставаться читаемым. Требование снято
   * осознанно: WCAG 1.4.3 недоступные контролы исключает, а кнопка, гаснущая
   * не так, как всё вокруг, читалась как активная.
   *
   * Подпись гаснет общей ролью всегда. Заливка и рамка уходят от ролей только у
   * темы, давшей недоступной кнопке свой сигнал, читаемый без цвета, — пунктир
   * рамки («Чертёж»: без заливки, пунктир `--gr-brd-hover`).
   */
  it('гаснет теми же ролями, что и остальной пакет', () => {
    const roles = [['bg', '--gr-disabled-bg'], ['fg', '--gr-disabled-fg'], ['brd', '--gr-disabled-brd']] as const

    for (const theme of THEME_MODES) {
      const buttonVars = buttonVarsOf(theme)
      const ownSignal = buttonVars['--gr-button-disabled-border-style'] === 'dashed'

      for (const [part, role] of roles) {
        if (ownSignal && part !== 'fg')
          continue
        const own = resolveColorExpression(`var(--gr-button-disabled-${part})`, buttonVars, derivedThemeVars)
        const shared = resolveColorExpression(`var(${role})`, themeVarsByName[theme], derivedThemeVars)

        expect(own, `${theme}: --gr-button-disabled-${part} разошёлся с ${role}`).toEqual(shared)
      }
    }
  })

  // Вариантные классы не остаются под disabled: два `bg-*` одной специфичности
  // разрулил бы порядок в сгенерированном CSS, а не порядок в списке классов.
  it('вариантные цвета не остаются под disabled', () => {
    const wrapper = mount(GrButton, {
      props: { disabled: true, tone: 'danger' },
      slots: { default: 'Delete' },
    })

    expect(wrapper.get('[data-gr-button]').classes().some(cls => cls.includes('--gr-danger'))).toBe(false)
  })

  // Ссылке нативный `disabled` не достаётся, поэтому раньше она не гасла вовсе.
  it('кнопка-ссылка приглушается так же, как кнопка', () => {
    const link = mount(GrButton, {
      props: { href: 'https://example.com', disabled: true },
      slots: { default: 'Docs' },
    })

    expect(link.element.tagName).toBe('A')
    expect(link.get('[data-gr-button]').classes()).toContain('bg-[var(--gr-button-disabled-bg)]')
    expect(link.attributes('aria-disabled')).toBe('true')
  })

  // Прозрачные варианты не должны превращаться в залитую плашку: поймано
  // визуальным гейтом на стрелках `GrPagination`.
  it('ghost и outline остаются прозрачными в отключённом виде', () => {
    const ghost = mount(GrButton, { props: { disabled: true, variant: 'ghost' }, slots: { default: 'Next' } })
    expect(ghost.get('[data-gr-button]').classes()).toContain('bg-transparent')
    expect(ghost.get('[data-gr-button]').classes()).toContain('text-[var(--gr-button-disabled-fg)]')

    const outline = mount(GrButton, { props: { disabled: true, variant: 'outline' }, slots: { default: 'Next' } })
    expect(outline.get('[data-gr-button]').classes()).toContain('bg-transparent')
    expect(outline.get('[data-gr-button]').classes()).toContain('border-[var(--gr-button-disabled-outline-brd)]')
  })

  it('loading отключённым не выглядит — у него свой спиннер', () => {
    const wrapper = mount(GrButton, { props: { loading: true }, slots: { default: 'Save' } })

    expect(wrapper.get('[data-gr-button]').classes()).not.toContain('bg-[var(--gr-button-disabled-bg)]')
  })
})

describe('GrButton — квадратный режим', () => {
  // Размер жил дважды: картой классов и инлайн-стилем, который её перекрывал.
  it('задан переменной с размерным дефолтом, без инлайн-стиля', () => {
    const wrapper = mount(GrButton, { props: { square: true, ariaLabel: 'Search' } })
    const button = wrapper.get('[data-gr-button]')

    expect(button.classes()).toContain('h-[var(--gr-button-square-size,2.5rem)]')
    expect(button.classes()).toContain('w-[var(--gr-button-square-size,2.5rem)]')
    expect(button.attributes('style')).toBeUndefined()
  })

  it('дефолт зависит от размера', () => {
    const xs = mount(GrButton, { props: { square: true, size: 'xs', ariaLabel: 'a' } })
    const lg = mount(GrButton, { props: { square: true, size: 'lg', ariaLabel: 'a' } })

    expect(xs.get('[data-gr-button]').classes()).toContain('h-[var(--gr-button-square-size,1.75rem)]')
    expect(lg.get('[data-gr-button]').classes()).toContain('h-[var(--gr-button-square-size,2.75rem)]')
  })
})

describe('GrButton — block, слоты и объявление загрузки', () => {
  it('block растягивает кнопку на ширину контейнера', () => {
    const wrapper = mount(GrButton, { props: { block: true }, slots: { default: 'Save' } })

    expect(wrapper.get('[data-gr-button]').classes()).toContain('w-full')
  })

  it('prefix и suffix рендерятся вокруг содержимого', () => {
    const wrapper = mount(GrButton, {
      slots: {
        prefix: '<i data-testid="pre" />',
        default: 'Save',
        suffix: '<i data-testid="suf" />',
      },
    })

    expect(wrapper.find('[data-testid="pre"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="suf"]').exists()).toBe(true)
  })

  // Спиннер и иконка префикса рядом читались бы как ошибка вёрстки.
  it('во время загрузки спиннер занимает место префикса', () => {
    const wrapper = mount(GrButton, {
      props: { loading: true },
      slots: { prefix: '<i data-testid="pre" />', default: 'Save' },
    })

    expect(wrapper.find('[data-testid="pre"]').exists()).toBe(false)
  })

  // `aria-busy` сам по себе часть AT не объявляет.
  it('загрузка добавляет скрытый текст к имени кнопки', async () => {
    const wrapper = mount(GrButton, { props: { loading: true }, slots: { default: 'Save' } })
    expect(wrapper.get('.sr-only').text()).toBe('Loading…')

    await wrapper.setProps({ loadingText: 'Сохраняем отчёт' })
    expect(wrapper.get('.sr-only').text()).toBe('Сохраняем отчёт')

    await wrapper.setProps({ loading: false })
    expect(wrapper.find('.sr-only').exists()).toBe(false)
  })
})

describe('GrButton — императивный API', () => {
  it('экспонирует пару focus/blur, как остальные контролы', () => {
    const wrapper = mount(GrButton, { slots: { default: 'Ok' }, attachTo: document.body })

    wrapper.vm.focus()
    expect(document.activeElement).toBe(wrapper.element)

    wrapper.vm.blur()
    expect(document.activeElement).not.toBe(wrapper.element)

    wrapper.unmount()
  })
})

describe('GrButton — нажатый переключатель', () => {
  it('`aria-pressed="true"` держит вид нажатия своего веса, выключенный — нет', () => {
    const on = mount(GrButton, { props: { variant: 'outline', tone: 'neutral' }, attrs: { 'aria-pressed': 'true' }, slots: { default: 'B' } })
    const off = mount(GrButton, { props: { variant: 'outline', tone: 'neutral' }, attrs: { 'aria-pressed': 'false' }, slots: { default: 'B' } })

    expect(on.get('[data-gr-button]').attributes('data-gr-pressed')).toBe('')
    expect(on.get('[data-gr-button]').classes()).toContain('data-[gr-pressed]:bg-[var(--gr-button-ghost-bg-active,var(--gr-button-neutral-ghost-bg-active))]')
    expect(off.get('[data-gr-button]').attributes('data-gr-pressed')).toBeUndefined()
  })

  it('зеркало нажатого вида есть только у нажатой кнопки — разметка остальных его не несёт', () => {
    const pressedTokens = (wrapper: ReturnType<typeof mount>) => wrapper.get('[data-gr-button]').classes().filter(name => name.startsWith('data-[gr-pressed]'))
    const plain = mount(GrButton, { props: { variant: 'outline', tone: 'neutral' }, slots: { default: 'B' } })
    const on = mount(GrButton, { props: { variant: 'outline', tone: 'neutral' }, attrs: { 'aria-pressed': 'true' }, slots: { default: 'B' } })
    const disabled = mount(GrButton, { props: { variant: 'outline', disabled: true }, attrs: { 'aria-pressed': 'true' }, slots: { default: 'B' } })

    expect(pressedTokens(plain)).toEqual([])
    expect(pressedTokens(disabled)).toEqual([])
    expect(pressedTokens(on).length).toBeGreaterThan(0)
  })

  it('в лотке и у недоступной кнопки атрибута нажатия нет', () => {
    const tray = mount({
      render: () => h(GrButtonGroup, { appearance: 'tray', ariaLabel: 'Вид' }, () => h(GrButton, { 'aria-pressed': 'true' }, () => 'B')),
    })
    const disabled = mount(GrButton, { props: { disabled: true }, attrs: { 'aria-pressed': 'true' }, slots: { default: 'B' } })

    expect(tray.get('[data-gr-button]').attributes('data-gr-pressed')).toBeUndefined()
    expect(disabled.get('[data-gr-button]').attributes('data-gr-pressed')).toBeUndefined()
  })
})

describe('GrButton — вес, рамки и объём', () => {
  it('рамка secondary в покое, под указателем и в нажатии — токены темы тона', () => {
    const className = grButtonClass({ variant: 'secondary', tone: 'primary', size: 'md', square: false })

    expect(className).toContain('border-[var(--gr-button-primary-border-soft)]')
    expect(className).toContain('hover:border-[var(--gr-button-primary-border-soft-hover)]')
    expect(className).toContain('active:border-[var(--gr-button-primary-border-hover)]')
  })

  it('нейтральная secondary лежит на поверхности карточки и приподнята тенью', () => {
    const className = grButtonClass({ variant: 'secondary', tone: 'neutral', size: 'md', square: false })

    expect(className).toContain('bg-[var(--gr-button-neutral-soft-bg)]')
    expect(className).toContain('border-[var(--gr-button-neutral-border-soft)]')
    expect(className).toContain('shadow-[var(--gr-button-surface-shadow)]')
  })

  it('объём есть у solid и снимается вместе с вариантом в отключённом виде', () => {
    const live = grButtonClass({ variant: 'primary', tone: 'primary', size: 'md', square: false })
    const disabled = grButtonClass({ variant: 'primary', tone: 'primary', size: 'md', square: false, disabled: true })

    expect(live).toContain('shadow-[var(--gr-button-divider,0_0_transparent),var(--gr-button-shadow),var(--gr-button-glow)_var(--gr-button-primary-glow)]')
    expect(live).toContain('hover:shadow-[var(--gr-button-divider,0_0_transparent),var(--gr-button-shadow),var(--gr-button-glow-hover)_var(--gr-button-primary-glow)]')
    expect(live).toContain('active:shadow-[var(--gr-button-divider,0_0_transparent),var(--gr-button-shadow-active)]')
    expect(live).toContain('bg-[image:var(--gr-button-solid-image)]')
    expect(disabled).not.toContain('shadow-')
    expect(disabled).not.toContain('--gr-button-solid-image')
  })

  // Формула темы не знает тона элемента: цвет тени — токен на тон.
  it('тень solid-кнопки берёт цвет своего тона', () => {
    for (const tone of filledTones)
      expect(grButtonClass({ variant: 'primary', tone, size: 'md', square: false })).toContain(`var(--gr-button-glow)_var(--gr-button-${tone}-glow)`)
  })

  it('недоступная кнопка берёт стиль рамки и штриховку у темы', () => {
    for (const variant of ['primary', 'secondary'] as const) {
      const classes = grButtonClass({ variant, tone: 'primary', size: 'md', square: false, disabled: true }).split(' ')
      expect(classes).toEqual(expect.arrayContaining(['[border-style:var(--gr-button-disabled-border-style)]', 'bg-[image:var(--gr-button-disabled-image)]']))
    }
    expect(grButtonClass({ variant: 'outline', tone: 'primary', size: 'md', square: false, disabled: true }).split(' ')).toContain('[border-style:var(--gr-button-disabled-border-style)]')
  })

  // Рамка в 1px есть у всех весов: иначе ghost на 2px уже соседей в ряду.
  it('ghost держит прозрачную рамку — и живой, и отключённый', () => {
    const live = grButtonClass({ variant: 'ghost', tone: 'primary', size: 'md', square: false }).split(' ')
    const disabled = grButtonClass({ variant: 'ghost', tone: 'primary', size: 'md', square: false, disabled: true }).split(' ')

    expect(live).toEqual(expect.arrayContaining(['border', 'border-transparent']))
    expect(disabled).toEqual(expect.arrayContaining(['border', 'border-transparent']))
  })

  it('начертание подписи — токен темы', () => {
    const wrapper = mount(GrButton, { slots: { default: 'Save' } })

    expect(wrapper.get('[data-gr-button]').classes()).toContain('[font-weight:var(--gr-button-font-weight)]')
  })

  // Кольцо вплотную к заливке того же тона читалось утолщением кнопки, а
  // `box-shadow` в forced-colors пропадает целиком.
  it('фокус — outline с отступом, а не ring', () => {
    const classes = mount(GrButton, { slots: { default: 'Save' } }).get('[data-gr-button]').classes()

    expect(classes).toEqual(expect.arrayContaining([
      'focus-visible:outline-solid',
      'focus-visible:outline-2',
      'outline-offset-[var(--gr-button-focus-offset-from)]',
      'focus-visible:outline-offset-[var(--gr-button-focus-offset)]',
      // С reduced-motion контур не въезжает: покой и фокус — один отступ.
      'motion-reduce:outline-offset-[var(--gr-button-focus-offset)]',
      'focus-visible:outline-[var(--gr-ring)]',
    ]))
    expect(classes.some(cls => /(?:^|:)ring(?:-|$)/.test(cls))).toBe(false)
  })
})

describe('GrButton — нажатие и курсор', () => {
  it('живая кнопка вдавливается, отключённая и ждущая — нет', () => {
    const live = mount(GrButton, { slots: { default: 'Save' } }).get('[data-gr-button]').classes()
    const disabled = mount(GrButton, { props: { disabled: true }, slots: { default: 'Save' } }).get('[data-gr-button]').classes()
    const loading = mount(GrButton, { props: { loading: true }, slots: { default: 'Save' } }).get('[data-gr-button]').classes()

    expect(live).toEqual(expect.arrayContaining(['motion-safe:active:scale-[var(--gr-button-press-scale)]', 'motion-safe:hover:translate-y-[var(--gr-button-lift)]']))
    expect(disabled.some(cls => cls.startsWith('motion-safe:'))).toBe(false)
    expect(loading.some(cls => cls.startsWith('motion-safe:'))).toBe(false)
  })

  it('ждущая сервер кнопка занята, а не запрещена', () => {
    const loading = mount(GrButton, { props: { loading: true }, slots: { default: 'Save' } }).get('[data-gr-button]').classes()
    const disabled = mount(GrButton, { props: { disabled: true }, slots: { default: 'Save' } }).get('[data-gr-button]').classes()

    expect(loading).toContain('cursor-progress')
    expect(loading).not.toContain('cursor-not-allowed')
    expect(disabled).toContain('cursor-not-allowed')
  })
})

describe('GrButton — загрузка без скачка ширины', () => {
  it('без префикса спиннер ложится поверх содержимого, подпись остаётся в DOM', () => {
    const wrapper = mount(GrButton, { props: { loading: true }, slots: { default: 'Save' } })
    const button = wrapper.get('[data-gr-button]')

    expect(button.attributes('data-gr-busy-overlay')).toBe('')
    expect(button.find('[data-gr-button-spinner]').attributes('aria-hidden')).toBe('true')
    expect(button.get('[data-gr-button-label]').text()).toBe('Save')
  })

  it('с префиксом спиннер встаёт на его место, а не поверх подписи', () => {
    const wrapper = mount(GrButton, {
      props: { loading: true },
      slots: { prefix: '<i data-testid="pre" />', default: 'Save' },
    })
    const button = wrapper.get('[data-gr-button]')

    expect(button.attributes('data-gr-busy-overlay')).toBeUndefined()
    expect(button.find('[data-gr-button-spinner]').exists()).toBe(false)
    expect(button.find('svg.animate-spin').exists()).toBe(true)
  })

  it('без загрузки поверх ничего не лежит', () => {
    const button = mount(GrButton, { slots: { default: 'Save' } }).get('[data-gr-button]')

    expect(button.attributes('data-gr-busy-overlay')).toBeUndefined()
    expect(button.find('[data-gr-button-spinner]').exists()).toBe(false)
  })

  it('спиннер растёт со ступенью', () => {
    const xs = mount(GrButton, { props: { loading: true, size: 'xs' }, slots: { default: 'Save' } })
    const lg = mount(GrButton, { props: { loading: true, size: 'lg' }, slots: { default: 'Save' } })

    expect(xs.get('svg.animate-spin').classes()).toEqual(expect.arrayContaining(['h-3.5', 'w-3.5']))
    expect(lg.get('svg.animate-spin').classes()).toEqual(expect.arrayContaining(['h-5', 'w-5']))
  })
})

describe('GrButton — отступы, зазор и иконки по ступени', () => {
  it('со стороны аддона отступ на 2px меньше', () => {
    const plain = mount(GrButton, { slots: { default: 'Save' } }).get('[data-gr-button]').classes()
    const adorned = mount(GrButton, {
      slots: { prefix: '<i />', default: 'Save', suffix: '<i />' },
    }).get('[data-gr-button]').classes()

    expect(plain).toEqual(expect.arrayContaining(['ps-4', 'pe-4']))
    expect(adorned).toEqual(expect.arrayContaining(['ps-3.5', 'pe-3.5']))
    expect(adorned).not.toContain('ps-4')
  })

  it('пустой аддон отступ не трогает', () => {
    const classes = mount(GrButton, {
      slots: { prefix: '<template v-if="false"><i /></template>', default: 'Save' },
    }).get('[data-gr-button]').classes()

    expect(classes).toContain('ps-4')
  })

  it('зазор растёт со ступенью', () => {
    expect(grButtonClass({ variant: 'primary', tone: 'primary', size: 'xs', square: false })).toContain('gap-1')
    expect(grButtonClass({ variant: 'primary', tone: 'primary', size: 'sm', square: false })).toContain('gap-1.5')
    expect(grButtonClass({ variant: 'primary', tone: 'primary', size: 'lg', square: false })).toContain('gap-2')
  })

  it('иконка в слоте берёт ступень от кнопки: 14 / 16 / 16 / 20', () => {
    const iconSize = (size: 'xs' | 'sm' | 'md' | 'lg') => mount(GrButton, {
      props: { size },
      slots: { default: () => h(GrIcon, null, () => h('svg')) },
    }).get('.gr-icon').attributes('style')

    expect(iconSize('xs')).toContain('--gr-icon-size: var(--gr-icon-size-xs)')
    expect(iconSize('sm')).toContain('--gr-icon-size: var(--gr-icon-size-sm)')
    expect(iconSize('md')).toContain('--gr-icon-size: var(--gr-icon-size-sm)')
    expect(iconSize('lg')).toContain('--gr-icon-size: var(--gr-icon-size-lg)')
  })

  it('явный размер иконки сильнее подсказки кнопки', () => {
    const wrapper = mount(GrButton, {
      props: { size: 'xs' },
      slots: { default: () => h(GrIcon, { size: 'lg' }, () => h('svg')) },
    })

    expect(wrapper.get('.gr-icon').attributes('style')).toContain('--gr-icon-size: var(--gr-icon-size-lg)')
  })
})

describe('GrButton — длинная подпись', () => {
  it('текстовая подпись оборачивается и режется многоточием', () => {
    const label = mount(GrButton, { slots: { default: 'Экспортировать отчёт за квартал' } }).get('[data-gr-button-label]')

    expect(label.classes()).toEqual(expect.arrayContaining(['min-w-0', 'truncate']))
  })

  // Обёртка сдвинула бы выравнивание иконки в квадратной кнопке.
  it('иконку и разметку в основном слоте не оборачивает', () => {
    const wrapper = mount(GrButton, { props: { square: true, ariaLabel: 'Копировать' }, slots: { default: '<svg />' } })

    expect(wrapper.find('[data-gr-button-label]').exists()).toBe(false)
  })

  it('обрезанная подпись получает полный текст подсказкой', async () => {
    const wrapper = mount(GrButton, { slots: { default: 'Экспортировать отчёт' } })
    const label = wrapper.get('[data-gr-button-label]')

    Object.defineProperty(label.element, 'scrollWidth', { configurable: true, value: 200 })
    Object.defineProperty(label.element, 'clientWidth', { configurable: true, value: 120 })
    await label.trigger('mouseenter')

    expect(label.attributes('title')).toBe('Экспортировать отчёт')
  })
})

describe('GrButton — ссылка в новую вкладку', () => {
  it('показывает стрелку и объявляет смену вкладки', () => {
    const wrapper = mount(GrButton, { props: { href: 'https://example.com', external: true }, slots: { default: 'Docs' } })
    const link = wrapper.get('[data-gr-button]')

    expect(link.findAll('svg').length).toBe(1)
    expect(link.get('.sr-only').text()).toBe('(opens in a new tab)')
    expect(link.classes()).toContain('pe-3.5')
  })

  it('та же подсказка — от явного target="_blank", а не только от external', () => {
    const wrapper = mount(GrButton, { props: { href: 'https://example.com', target: '_blank' }, slots: { default: 'Docs' } })

    expect(wrapper.get('.sr-only').text()).toBe('(opens in a new tab)')
  })

  it('с aria-label подсказка дописывается в само имя', () => {
    const wrapper = mount(GrButton, {
      props: { href: 'https://example.com', external: true, square: true, ariaLabel: 'GitHub' },
      slots: { default: '<svg />' },
    })
    const link = wrapper.get('[data-gr-button]')

    expect(link.attributes('aria-label')).toBe('GitHub, opens in a new tab')
    expect(link.find('.sr-only').exists()).toBe(false)
  })

  it('обычная и отключённая ссылки подсказки не получают', () => {
    const plain = mount(GrButton, { props: { href: '/reports' }, slots: { default: 'Отчёты' } })
    const disabled = mount(GrButton, { props: { href: 'https://example.com', external: true, disabled: true }, slots: { default: 'Docs' } })

    expect(plain.find('.sr-only').exists()).toBe(false)
    expect(disabled.find('.sr-only').exists()).toBe(false)
  })
})

describe('GrButton — скругление по ступеням', () => {
  it('ступень ставит свой радиус, углы берут его после ручки приложения', () => {
    for (const size of ['xs', 'sm', 'md', 'lg'] as const) {
      for (const square of [false, true]) {
        const classes = grButtonClass({ variant: 'primary', tone: 'primary', size, square }).split(' ')
        expect(classes).toContain(`[--gr-button-step-radius:var(--gr-button-radius-${size})]`)
      }
    }
    const classes = mount(GrButton, { slots: { default: 'Save' } }).get('[data-gr-button]').classes()
    for (const corner of ['ss', 'se', 'ee', 'es'])
      expect(classes).toContain(`rounded-${corner}-[var(--gr-button-radius-${corner},var(--gr-button-corner-radius))]`)
  })
})

describe('GrButton — ячейка иконки', () => {
  const icon = () => h('i', { 'data-prefix': '' })

  it('префикс в ячейке у начального края: без бокового отступа, за перегородкой', () => {
    const wrapper = mount(GrButton, { props: { prefixCell: true }, slots: { default: () => 'Экспорт', prefix: icon } })
    const button = wrapper.get('[data-gr-button]')
    const cell = wrapper.get('[data-gr-button-cell]')

    expect(cell.find('[data-prefix]').exists()).toBe(true)
    expect(cell.classes()).toEqual(expect.arrayContaining(['aspect-square', 'self-stretch', 'border-e']))
    expect(button.classes()).toContain('ps-0')
    expect(button.classes().some(cls => /^ps-\d/.test(cls) && cls !== 'ps-0')).toBe(false)
  })

  it('ячейки нет без префикса и у квадратной кнопки', () => {
    expect(mount(GrButton, { props: { prefixCell: true }, slots: { default: () => 'Ок' } }).find('[data-gr-button-cell]').exists()).toBe(false)
    const square = mount(GrButton, { props: { prefixCell: true, square: true, ariaLabel: 'Экспорт' }, slots: { prefix: icon } })
    expect(square.find('[data-gr-button-cell]').exists()).toBe(false)
  })

  it('спиннер загрузки занимает ячейку, а не встаёт рядом', () => {
    const wrapper = mount(GrButton, { props: { prefixCell: true, loading: true }, slots: { default: () => 'Экспорт', prefix: icon } })

    expect(wrapper.get('[data-gr-button-cell]').find('.animate-spin').exists()).toBe(true)
    expect(wrapper.findAll('.animate-spin')).toHaveLength(1)
    expect(wrapper.find('[data-prefix]').exists()).toBe(false)
  })

  it('ячейку включает тема через componentDefaults', () => {
    const wrapper = mount(GrConfigProvider, {
      props: { componentDefaults: { GrButton: { prefixCell: true } } },
      slots: { default: () => h(GrButton, null, { default: () => 'Экспорт', prefix: icon }) },
    })

    expect(wrapper.find('[data-gr-button-cell]').exists()).toBe(true)
  })
})

describe('GrButton · загрузка бегущим отрезком', () => {
  it('отрезок по кромке: без спиннера, содержимое на месте, aria-busy и скрытый текст', () => {
    const wrapper = mount(GrButton, {
      props: { loading: true, loadingIndicator: 'track' },
      slots: { default: () => 'Сохранить', prefix: () => h('i', { 'data-prefix': '' }) },
    })
    const button = wrapper.get('[data-gr-button]')

    expect(button.attributes('data-gr-busy-track')).toBe('')
    expect(button.attributes('data-gr-busy-overlay')).toBeUndefined()
    expect(button.attributes('aria-busy')).toBe('true')
    expect(wrapper.get('[data-gr-button-track]').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.animate-spin').exists()).toBe(false)
    expect(wrapper.find('[data-prefix]').exists()).toBe(true)
    expect(wrapper.get('[data-gr-button-label]').text()).toBe('Сохранить')
    expect(wrapper.find('.sr-only').exists()).toBe(true)
  })

  it('кромка есть у любой кнопки — квадратная тоже бежит отрезком', () => {
    const wrapper = mount(GrButton, {
      props: { loading: true, loadingIndicator: 'track', square: true, ariaLabel: 'Обновить' },
      slots: { default: () => h('svg', { 'data-icon': '' }) },
    })

    expect(wrapper.find('[data-gr-button-track]').exists()).toBe(true)
    expect(wrapper.find('.animate-spin').exists()).toBe(false)
    expect(wrapper.find('[data-icon]').exists()).toBe(true)
  })

  it('без загрузки отрезка нет', () => {
    const wrapper = mount(GrButton, { props: { loadingIndicator: 'track' }, slots: { default: () => 'Ок' } })

    expect(wrapper.find('[data-gr-button-track]').exists()).toBe(false)
    expect(wrapper.get('[data-gr-button]').attributes('data-gr-busy-track')).toBeUndefined()
  })
})

describe('GrButton · загрузка мерцанием подписи', () => {
  it('свет по подписи: без спиннера, подпись и префикс на месте, aria-busy и скрытый текст', () => {
    const wrapper = mount(GrButton, {
      props: { loading: true, loadingIndicator: 'shimmer' },
      slots: { default: () => 'Сохранить', prefix: () => h('i', { 'data-prefix': '' }) },
    })
    const button = wrapper.get('[data-gr-button]')

    expect(button.attributes('data-gr-busy-shimmer')).toBe('')
    expect(button.attributes('data-gr-busy-overlay')).toBeUndefined()
    expect(button.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('.animate-spin').exists()).toBe(false)
    expect(wrapper.find('[data-prefix]').exists()).toBe(true)
    expect(wrapper.get('[data-gr-button-label]').text()).toBe('Сохранить')
    expect(wrapper.find('.sr-only').exists()).toBe(true)
  })

  it('у кнопки без текстовой подписи мерцать нечему — остаётся спиннер', () => {
    const wrapper = mount(GrButton, {
      props: { loading: true, loadingIndicator: 'shimmer', square: true, ariaLabel: 'Обновить' },
      slots: { default: () => h('svg', { 'data-icon': '' }) },
    })

    expect(wrapper.get('[data-gr-button]').attributes('data-gr-busy-shimmer')).toBeUndefined()
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('без загрузки атрибута нет; по умолчанию — спиннер', () => {
    expect(mount(GrButton, { props: { loadingIndicator: 'shimmer' }, slots: { default: () => 'Ок' } }).get('[data-gr-button]').attributes('data-gr-busy-shimmer')).toBeUndefined()
    expect(mount(GrButton, { props: { loading: true }, slots: { default: () => 'Ок' } }).find('.animate-spin').exists()).toBe(true)
  })

  it('вид загрузки — из componentDefaults (тема, провайдер)', () => {
    const wrapper = mount(GrConfigProvider, {
      props: { componentDefaults: { GrButton: { loadingIndicator: 'shimmer' } } },
      slots: { default: () => h(GrButton, { loading: true }, { default: () => 'Сохранить' }) },
    })

    expect(wrapper.get('[data-gr-button]').attributes('data-gr-busy-shimmer')).toBe('')
  })
})
