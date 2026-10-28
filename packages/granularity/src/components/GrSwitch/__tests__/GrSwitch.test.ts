import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrSwitch from '../GrSwitch.vue'
import { GR_COMPONENT_SIZES } from '../../shared/sizes'
import { GR_SWITCH_STATE_TEXT_SIZES, type GrSwitchSize, SWITCH_THUMB_GAP } from '../grSwitchStyles'
import { componentSheet, lookElement } from '../../../__tests__/componentSheet'
import { readComponentThemeVars } from '../../../__tests__/cssContrast'
import { THEME_MODES } from '../../../__tests__/themeCss'

/** Значения токенов переключателя в каждой теме каталога; первая — базовая. */
const THEME_GEOMETRY = THEME_MODES.map(mode => ({ key: mode.key, vars: readComponentThemeVars('GrSwitch', mode.key) }))
const BASE = THEME_GEOMETRY[0]

function toPixels(value: string): number {
  if (value.endsWith('rem'))
    return Number.parseFloat(value) * 16
  if (value.endsWith('px'))
    return Number.parseFloat(value)
  throw new Error(`не длина: «${value}»`)
}

/** Длина CSS-значения в пикселях при значениях темы: `var(--x)`, `calc(var(--x) - 4px)`, `0.75rem`. */
function length(value: string | undefined, vars: Record<string, string> = BASE.vars): number {
  if (!value)
    throw new Error('нет значения')

  const expression = value.replace(/var\((--[\w-]+)\)/g, (_, name: string) => {
    if (!vars[name])
      throw new Error(`нет значения ${name} в теме`)
    return vars[name]
  })
  const [first, ...rest] = expression.replace(/^calc\((.*)\)$/, '$1').split(/\s+([+-])\s+/)
  let total = toPixels(first)
  for (let index = 0; index < rest.length; index += 2)
    total += (rest[index] === '+' ? 1 : -1) * toPixels(rest[index + 1])

  return total
}

const { look } = componentSheet('GrSwitch/GrSwitch.vue')
const lookOf = (wrapper: { element: Element }) => look(wrapper.element)

/** Детали переключателя без монтирования: геометрию гейты читают из листа. */
function parts(size: GrSwitchSize, options: { checked?: boolean, text?: 'fixed' | 'auto' } = {}) {
  const root = lookElement('button', { 'data-gr-switch': '', 'data-gr-size': size, 'data-gr-text': options.text, 'aria-checked': options.checked ? 'true' : 'false' })
  const track = lookElement('span', { 'data-gr-switch-track': '' })
  const text = lookElement('span', { 'data-gr-switch-state-text': '' })
  const thumb = lookElement('span', { 'data-gr-switch-thumb': '' })
  const icon = lookElement('span', { 'data-gr-switch-thumb-icon': '' })
  thumb.append(icon)
  track.append(text, thumb)
  root.append(track)

  return { root: look(root), track: look(track), text: look(text), thumb: look(thumb), icon: look(icon) }
}

describe('GrSwitch', () => {
  it('рендерит checked-state, label и вычисляет custom active color', () => {
    const wrapper = mount(GrSwitch, {
      props: {
        modelValue: true,
        ariaLabel: 'Notifications',
        activeBackgroundColor: ' #10b981 ',
      },
      slots: {
        default: 'Enabled',
      },
    })

    const button = wrapper.get('[role="switch"]')
    expect(button.attributes('aria-checked')).toBe('true')
    expect(button.attributes('aria-label')).toBe('Notifications')

    const track = wrapper.get('[data-testid="gr-switch-track"]')
    expect(lookOf(track)).toMatchObject({ height: 'var(--gr-switch-track-height-md)', width: 'var(--gr-switch-track-width-md)' })
    expect(track.attributes('style')).toContain('--gr-switch-track-bg: #10b981')
    expect(track.attributes('style')).toContain('--gr-switch-track-brd: #10b981')

    expect(lookOf(wrapper.get('[data-testid="gr-switch-thumb"]')).transform).toBe('translateX(-100%)')
    expect(wrapper.text()).toContain('Enabled')
  })

  it('эмитит update:modelValue при клике, если компонент активен', async () => {
    const wrapper = mount(GrSwitch, {
      props: {
        modelValue: false,
      },
    })

    await wrapper.get('[role="switch"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('не эмитит update:modelValue в disabled-состоянии и учитывает size=lg', async () => {
    const wrapper = mount(GrSwitch, {
      props: {
        modelValue: true,
        disabled: true,
        size: 'lg',
        inactiveBackgroundColor: ' #94a3b8 ',
      },
      slots: {
        default: 'Disabled',
      },
    })

    await wrapper.get('[role="switch"]').trigger('click')

    const track = wrapper.get('[data-testid="gr-switch-track"]')
    expect(lookOf(track)).toMatchObject({ height: 'var(--gr-switch-track-height-lg)', width: 'var(--gr-switch-track-width-lg)' })

    expect(lookOf(wrapper.get('[data-testid="gr-switch-thumb"]'))).toMatchObject({
      height: 'calc(var(--gr-switch-track-height-lg) - 4px)',
      width: 'calc(var(--gr-switch-track-height-lg) - 4px)',
      transform: 'translateX(-100%)',
    })

    expect(lookOf(wrapper.get('[data-gr-switch-label]'))['font-size']).toBe('var(--gr-text-base)')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
describe('GrSwitch — нативная форма', () => {
  it('скрытое поле отправляется только у включённого переключателя с именем', async () => {
    const wrapper = mount(GrSwitch, { props: { modelValue: true, name: 'notifications' } })
    const hidden = wrapper.get('input[type="hidden"]')

    expect(hidden.attributes('name')).toBe('notifications')
    expect(hidden.attributes('value')).toBe('on')

    // Выключенный не отправляется вовсе — сервер видит отсутствие ключа, как у чекбокса.
    await wrapper.setProps({ modelValue: false })
    expect(wrapper.find('input[type="hidden"]').exists()).toBe(false)

    await wrapper.setProps({ modelValue: true, disabled: true })
    expect(wrapper.find('input[type="hidden"]').exists()).toBe(false)
  })

  it('без name скрытого поля нет даже во включённом состоянии', () => {
    const wrapper = mount(GrSwitch, { props: { modelValue: true } })

    expect(wrapper.find('input[type="hidden"]').exists()).toBe(false)
  })

  it('value и form доходят до скрытого поля', () => {
    const wrapper = mount(GrSwitch, {
      props: { modelValue: true, name: 'plan', value: 'pro', form: 'settings' },
    })
    const hidden = wrapper.get('input[type="hidden"]')

    expect(hidden.attributes('value')).toBe('pro')
    expect(hidden.attributes('form')).toBe('settings')
  })

  it('атрибуты потребителя садятся на кнопку, а не теряются во фрагменте', () => {
    const wrapper = mount(GrSwitch, {
      props: { modelValue: true, name: 'x' },
      attrs: { 'class': 'my-switch', 'data-test': 'toggle' },
    })
    const button = wrapper.get('[role="switch"]')

    expect(button.classes()).toContain('my-switch')
    expect(button.attributes('data-test')).toBe('toggle')
    expect(wrapper.get('input[type="hidden"]').classes()).not.toContain('my-switch')
  })
})

describe('GrSwitch — состояния и события', () => {
  it('change эмитится вместе с update:modelValue', async () => {
    const wrapper = mount(GrSwitch, { props: { modelValue: false } })

    await wrapper.get('[role="switch"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    expect(wrapper.emitted('change')).toEqual([[true]])
  })

  it('readonly и loading не переключают', async () => {
    const readonly = mount(GrSwitch, { props: { modelValue: false, readonly: true } })
    await readonly.get('[role="switch"]').trigger('click')
    expect(readonly.emitted('update:modelValue')).toBeUndefined()
    expect(readonly.get('[role="switch"]').attributes('aria-readonly')).toBe('true')

    const loading = mount(GrSwitch, { props: { modelValue: false, loading: true } })
    await loading.get('[role="switch"]').trigger('click')
    expect(loading.emitted('update:modelValue')).toBeUndefined()
  })

  it('loading показывает спиннер и не молчит для диктора', () => {
    const wrapper = mount(GrSwitch, { props: { modelValue: true, loading: true } })
    const button = wrapper.get('[role="switch"]')

    expect(button.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[data-gr-switch-spinner]').exists()).toBe(true)
    expect(wrapper.get('[data-gr-switch-loading-text]').text()).toBe('Saving…')
    expect(wrapper.get('[data-gr-switch-loading-text]').classes()).toContain('sr-only')
  })

  it('disabled гасится токенами, а не прозрачностью', () => {
    const wrapper = mount(GrSwitch, {
      props: { modelValue: true, disabled: true, activeBackgroundColor: '#10b981' },
      slots: { default: 'Off limits' },
    })

    const button = wrapper.get('[role="switch"]')
    expect(lookOf(button).opacity).toBeUndefined()

    // Токен перебивает и кастомный цвет: иначе выключенный выглядел бы рабочим.
    const track = wrapper.get('[data-testid="gr-switch-track"]')
    expect(track.attributes('style')).toBeUndefined()
    expect(lookOf(track)).toMatchObject({ 'background-color': 'var(--gr-disabled-bg)', 'border-color': 'var(--gr-disabled-brd)' })
    expect(lookOf(wrapper.get('[data-gr-switch-label]')).color).toBe('var(--gr-disabled-fg)')
  })

  it('labelPosition разворачивает ряд, не трогая порядок узлов', () => {
    const end = mount(GrSwitch, { props: { modelValue: true }, slots: { default: 'Label' } })
    expect(lookOf(end.get('[role="switch"]'))['flex-direction']).toBeUndefined()

    const start = mount(GrSwitch, {
      props: { modelValue: true, labelPosition: 'start' },
      slots: { default: 'Label' },
    })
    const button = start.get('[role="switch"]')
    expect(lookOf(button)['flex-direction']).toBe('row-reverse')
    // Диктор читает DOM-порядок, поэтому дорожка остаётся первой.
    expect(button.element.firstElementChild?.getAttribute('data-gr-switch-track')).not.toBeNull()
  })

  it('xs из GrConfigProvider доходит до переключателя', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrSwitch },
      template: `
        <GrConfigProvider size="xs">
          <GrSwitch :model-value="true" />
        </GrConfigProvider>
      `,
    })

    const track = mount(Harness).get('[data-testid="gr-switch-track"]')
    expect(lookOf(track)).toMatchObject({ height: 'var(--gr-switch-track-height-xs)', width: 'var(--gr-switch-track-width-xs)' })
  })

  it('клавиатура остаётся нативной: это button без своих keydown-перехватов', () => {
    const wrapper = mount(GrSwitch, { props: { modelValue: false } })
    const button = wrapper.get('[role="switch"]')

    // Space и Enter на `<button>` обрабатывает браузер и превращает в click —
    // поэтому своих обработчиков быть не должно, иначе они его перебьют.
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('tabindex')).toBeUndefined()
  })
})

/**
 * Зазоры бегунка — таблицей, а не глазами.
 *
 * Зазоры расходились: у `xs`/`sm` справа оставался 1px против 2px слева, у `lg` —
 * 2 против 3, верно было только у `md`. Горизонталь теперь задана структурно
 * (`left: calc(100% − зазор)` плюс `translateX(-100%)`), поэтому проверять надо
 * две вещи: что вертикаль сходится с той же константой на каждой ступени и что
 * классы действительно выражают этот механизм, а не вернулись к числам.
 */
describe('GrSwitch — геометрия бегунка', () => {
  it('бегунок выведен из высоты дорожки: зазор сходится в каждой теме и на каждой ступени', () => {
    for (const { key, vars } of THEME_GEOMETRY) {
      for (const size of GR_COMPONENT_SIZES) {
        // Дорожка — `border-box` с рамкой 1px, бегунок центруется в content-box.
        const trackHeight = length(parts(size).track.height, vars) - 2
        const gap = (trackHeight - length(parts(size).thumb.height, vars)) / 2

        expect(gap, `${key} ${size}: вертикальный зазор`).toBe(SWITCH_THUMB_GAP)
      }
    }
  })

  it('горизонталь не зависит от ширины дорожки', () => {
    const off = parts('md').thumb
    const on = parts('md', { checked: true }).thumb

    expect(off.left).toBe(`${SWITCH_THUMB_GAP}px`)
    // Ровно эта пара и делает возможным `autoWidth`: ни одного числа от ширины.
    expect(on.left).toBe(`calc(100% - ${SWITCH_THUMB_GAP}px)`)
    expect(on.transform).toBe('translateX(-100%)')
    expect(JSON.stringify([off, on])).not.toMatch(/translateX\(-?[\d.]+px/)
  })

  it('бегунок с зазорами укладывается в дорожку в каждой теме', () => {
    for (const { key, vars } of THEME_GEOMETRY) {
      for (const size of GR_COMPONENT_SIZES) {
        const trackWidth = length(parts(size).track.width, vars) - 2

        expect(length(parts(size).thumb.width, vars) + SWITCH_THUMB_GAP * 2, `${key} ${size}`)
          .toBeLessThanOrEqual(trackWidth)
      }
    }
  })

  it('знак на бегунке меньше бегунка в каждой теме', () => {
    for (const { key, vars } of THEME_GEOMETRY) {
      for (const size of GR_COMPONENT_SIZES) {
        const thumb = length(parts(size).thumb.height, vars)
        const cap = thumb - 4

        expect(Math.min(length(parts(size).icon.height, vars), cap), `${key} ${size}`).toBeLessThan(thumb)
        expect(parts(size).icon['max-height']).toBe(`calc(var(--gr-switch-track-height-${size}) - 8px)`)
      }
    }
  })

  it('растущая дорожка берёт ширину дорожки с подписью нижней границей', () => {
    for (const size of GR_SWITCH_STATE_TEXT_SIZES) {
      expect(length(parts(size, { text: 'auto' }).track['min-width']), size).toBe(length(parts(size, { text: 'fixed' }).track.width))
      // Тянется только строка: высота остаётся ступенью.
      expect(length(parts(size, { text: 'auto' }).track.height), size).toBe(length(parts(size).track.height))
    }
  })
})

describe('GrSwitch — подпись состояния в дорожке', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('по умолчанию подписи нет', () => {
    const wrapper = mount(GrSwitch, { props: { modelValue: true } })

    expect(wrapper.find('[data-testid="gr-switch-state-text"]').exists()).toBe(false)
  })

  it('текст меняется вместе с состоянием и уходит на свободную сторону', async () => {
    const wrapper = mount(GrSwitch, { props: { modelValue: false, showStateText: true } })
    const stateText = () => wrapper.get('[data-testid="gr-switch-state-text"]')

    // Бегунок слева — подпись отступает от него слева и стоит справа.
    expect(stateText().text()).toBe('OFF')
    expect(lookOf(stateText())['padding-left']).toBe('calc(var(--gr-switch-track-height-md) - 3px)')

    await wrapper.setProps({ modelValue: true })
    expect(stateText().text()).toBe('ON')
    expect(lookOf(stateText())['padding-right']).toBe('calc(var(--gr-switch-track-height-md) - 3px)')
  })

  it('подпись скрыта от диктора: состояние уже объявлено через aria-checked', () => {
    const wrapper = mount(GrSwitch, {
      props: { modelValue: true, showStateText: true, ariaLabel: 'Wi-Fi' },
    })

    // Дорожка лежит внутри `<button role="switch">`, поэтому видимый текст
    // вошёл бы в доступное имя: «Wi-Fi ON» вместо «Wi-Fi».
    expect(wrapper.get('[data-testid="gr-switch-state-text"]').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('[role="switch"]').attributes('aria-label')).toBe('Wi-Fi')
    expect(wrapper.get('[role="switch"]').attributes('aria-checked')).toBe('true')
  })

  it('свои тексты перекрывают локаль', async () => {
    const wrapper = mount(GrSwitch, {
      props: {
        modelValue: true,
        showStateText: true,
        checkedText: 'ДА',
        uncheckedText: 'НЕТ',
      },
    })

    expect(wrapper.get('[data-testid="gr-switch-state-text"]').text()).toBe('ДА')

    await wrapper.setProps({ modelValue: false })
    expect(wrapper.get('[data-testid="gr-switch-state-text"]').text()).toBe('НЕТ')
  })

  it('на мелких ступенях подписи нет, и dev объясняет почему', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(GrSwitch, {
      props: { modelValue: true, showStateText: true, size: 'sm' },
    })

    expect(wrapper.find('[data-testid="gr-switch-state-text"]').exists()).toBe(false)
    expect(warn).toHaveBeenCalledTimes(1)
    // В предупреждении причина, а не «не поддерживается»: иначе проп выглядит сломанным.
    // Чисел нет: место рядом с бегунком у каждой темы своё.
    expect(warn.mock.calls[0][0]).toContain('меньше места')
    expect(warn.mock.calls[0][0]).toContain('`sm`')
    expect(warn.mock.calls[0][0]).toContain('`md` и `lg`')
  })

  it('на поддержанной ступени предупреждения нет', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(GrSwitch, { props: { modelValue: true, showStateText: true, size: 'lg' } })

    expect(warn).not.toHaveBeenCalled()
  })

  it('цвет подписи — хук с фолбэком по состоянию, а не инлайн-значение', async () => {
    const wrapper = mount(GrSwitch, { props: { modelValue: true, showStateText: true } })
    const stateText = () => wrapper.get('[data-testid="gr-switch-state-text"]')

    // Инлайн победил бы CSS потребителя, и переопределить токен было бы нечем.
    expect(stateText().attributes('style')).toBeUndefined()
    expect(lookOf(stateText()).color).toBe('var(--gr-switch-state-text-fg, var(--gr-selected-fg))')

    await wrapper.setProps({ modelValue: false })
    expect(lookOf(stateText()).color).toBe('var(--gr-switch-state-text-fg, var(--gr-muted-fg))')

    await wrapper.setProps({ disabled: true })
    expect(lookOf(stateText()).color).toBe('var(--gr-switch-state-text-fg, var(--gr-disabled-fg))')
  })

  it('кегль берётся ступенью, а не одной константой на обе', () => {
    const md = mount(GrSwitch, { props: { modelValue: true, showStateText: true } })
    const lg = mount(GrSwitch, { props: { modelValue: true, showStateText: true, size: 'lg' } })

    const mdSize = lookOf(md.get('[data-testid="gr-switch-state-text"]'))['font-size']
    const lgSize = lookOf(lg.get('[data-testid="gr-switch-state-text"]'))['font-size']

    expect(mdSize).toBe('var(--gr-switch-state-text-size, 9px)')
    expect(lgSize).toBe('var(--gr-switch-state-text-size, 11px)')
  })

  it('showStateText из GrConfigProvider доходит до переключателя', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrSwitch },
      template: `
        <GrConfigProvider :component-defaults="{ GrSwitch: { showStateText: true } }">
          <GrSwitch :model-value="true" />
        </GrConfigProvider>
      `,
    })

    expect(mount(Harness).find('[data-testid="gr-switch-state-text"]').exists()).toBe(true)
  })
})

/**
 * Место под подпись — тот же расчёт, что и у бегунка: отступ со стороны бегунка
 * равен `бегунок + зазор`, а остаток и есть свободная ширина. Считаем из
 * значений каждой темы каталога: тема с компактным переключателем обязана
 * отдать подписи место шириной дорожки с подписью, а не урезать его.
 */
describe('GrSwitch — геометрия подписи', () => {
  function room(size: GrSwitchSize, vars: Record<string, string>, text?: 'fixed'): { padding: number, free: number } {
    const trackWidth = length(parts(size, { text }).track.width, vars) - 2
    const padding = length(parts(size).thumb.width, vars) + SWITCH_THUMB_GAP

    return { padding, free: trackWidth - padding }
  }

  it('отступ равен бегунку с зазором в каждой теме', () => {
    for (const { key, vars } of THEME_GEOMETRY) {
      for (const size of GR_SWITCH_STATE_TEXT_SIZES) {
        const { padding } = room(size, vars, 'fixed')

        expect(length(parts(size, { checked: true, text: 'fixed' }).text['padding-right'], vars), `${key} ${size}`).toBe(padding)
        expect(length(parts(size, { text: 'fixed' }).text['padding-left'], vars), `${key} ${size}`).toBe(padding)
      }
    }
  })

  it('в базовой теме места 13 / 17 / 21 / 29px, и подпись живёт ровно там, где хватает', () => {
    const free = Object.fromEntries(GR_COMPONENT_SIZES.map(size => [size, room(size, BASE.vars).free]))

    expect(free).toEqual({ xs: 13, sm: 17, md: 21, lg: 29 })
    for (const size of GR_COMPONENT_SIZES)
      expect(free[size] >= free.md, size).toBe((GR_SWITCH_STATE_TEXT_SIZES as readonly string[]).includes(size))
  })

  it('в каждой теме места под подпись не меньше, чем в базовой', () => {
    for (const size of GR_SWITCH_STATE_TEXT_SIZES) {
      const base = room(size, BASE.vars, 'fixed').free

      for (const { key, vars } of THEME_GEOMETRY)
        expect(room(size, vars, 'fixed').free, `${key} ${size}`).toBeGreaterThanOrEqual(base)
    }
  })
})

describe('GrSwitch — растущая дорожка', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('по умолчанию ширина фиксирована', () => {
    const wrapper = mount(GrSwitch, { props: { modelValue: true, showStateText: true } })
    const track = wrapper.get('[data-testid="gr-switch-track"]')

    expect(lookOf(track).width).toBe('var(--gr-switch-text-track-width-md)')
    expect(lookOf(track)['min-width']).toBeUndefined()
    // Подпись накрывает дорожку и на её размер не влияет.
    expect(lookOf(wrapper.get('[data-testid="gr-switch-state-text"]')).position).toBe('absolute')
  })

  it('autoWidth отдаёт ширину подписи, оставляя ступень нижней границей', () => {
    const wrapper = mount(GrSwitch, {
      props: { modelValue: true, showStateText: true, autoWidth: true },
    })
    const track = wrapper.get('[data-testid="gr-switch-track"]')

    expect(lookOf(track)).toMatchObject({ 'min-width': 'var(--gr-switch-text-track-width-md)', 'width': 'auto' })

    const stateText = wrapper.get('[data-testid="gr-switch-state-text"]')
    expect(lookOf(stateText).position).toBeUndefined()
    // Со свободной стороны появляется отступ: центровать текст больше нечем.
    expect(lookOf(stateText)).toMatchObject({ 'padding-left': '8px', 'padding-right': 'calc(var(--gr-switch-track-height-md) - 3px + 8px)' })
  })

  it('невидимый дубль держит ширину при переключении', async () => {
    const wrapper = mount(GrSwitch, {
      props: { modelValue: true, showStateText: true, autoWidth: true },
    })
    const ghost = () => wrapper.get('[data-gr-switch-state-text-ghost]')

    // Дубль — всегда противоположное состояние, отсюда максимум из двух ширин.
    expect(ghost().text()).toBe('OFF')
    expect(lookOf(ghost()).visibility).toBe('hidden')

    await wrapper.setProps({ modelValue: false })
    expect(ghost().text()).toBe('ON')
  })

  it('при фиксированной ширине дубля нет вовсе', () => {
    const wrapper = mount(GrSwitch, { props: { modelValue: true, showStateText: true } })

    expect(wrapper.find('[data-gr-switch-state-text-ghost]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="gr-switch-state-text"]').text()).toBe('ON')
  })

  it('autoWidth без подписи ничего не растягивает и говорит об этом', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(GrSwitch, { props: { modelValue: true, autoWidth: true } })

    expect(lookOf(wrapper.get('[data-testid="gr-switch-track"]')).width).toBe('var(--gr-switch-track-width-md)')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('showStateText')
  })

  it('autoWidth из GrConfigProvider доходит до переключателя', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrSwitch },
      template: `
        <GrConfigProvider :component-defaults="{ GrSwitch: { showStateText: true, autoWidth: true } }">
          <GrSwitch :model-value="true" />
        </GrConfigProvider>
      `,
    })

    expect(lookOf(mount(Harness).get('[data-testid="gr-switch-track"]'))['min-width']).toBe('var(--gr-switch-text-track-width-md)')
  })
})

/** Отступы растущей дорожки считаются из той же геометрии, что и фиксированной. */
describe('GrSwitch — геометрия растущей подписи', () => {
  it('со стороны бегунка отступ больше фиксированного ровно на воздух', () => {
    for (const size of GR_SWITCH_STATE_TEXT_SIZES) {
      const autoOn = parts(size, { checked: true, text: 'auto' }).text
      const autoOff = parts(size, { text: 'auto' }).text
      const air = length(autoOn['padding-left'])

      expect(length(autoOn['padding-right']), size)
        .toBe(length(parts(size, { checked: true, text: 'fixed' }).text['padding-right']) + air)
      // Воздух одинаков с обеих сторон, иначе подпись стоит не по центру остатка.
      expect(length(autoOff['padding-right']), size).toBe(air)
      expect(length(autoOff['padding-left']), size)
        .toBe(length(parts(size, { text: 'fixed' }).text['padding-left']) + air)
    }
  })

  it('отступ со стороны бегунка перекрывает сам бегунок с зазором', () => {
    for (const size of GR_SWITCH_STATE_TEXT_SIZES) {
      // Иначе текст лёг бы на бегунок, как только дорожка перестала центровать.
      expect(length(parts(size, { checked: true, text: 'auto' }).text['padding-right']), size)
        .toBeGreaterThan(length(parts(size).thumb.width) + SWITCH_THUMB_GAP)
    }
  })
})

describe('GrSwitch — иконка действия на бегунке', () => {
  it('без слотов обёртки в бегунке нет вовсе', () => {
    const wrapper = mount(GrSwitch, { props: { modelValue: true } })

    expect(wrapper.find('[data-testid="gr-switch-thumb-icon"]').exists()).toBe(false)
  })

  it('знак меняется вместе с состоянием', async () => {
    const wrapper = mount(GrSwitch, {
      props: { modelValue: true },
      slots: {
        'checked-icon': '<i data-test="on" />',
        'unchecked-icon': '<i data-test="off" />',
      },
    })
    const icon = () => wrapper.get('[data-testid="gr-switch-thumb-icon"]')

    expect(icon().find('[data-test="on"]').exists()).toBe(true)

    await wrapper.setProps({ modelValue: false })
    expect(icon().find('[data-test="off"]').exists()).toBe(true)
    expect(icon().find('[data-test="on"]').exists()).toBe(false)
  })

  it('слоты независимы: знак может быть только в одном состоянии', async () => {
    const wrapper = mount(GrSwitch, {
      props: { modelValue: true },
      slots: { 'checked-icon': '<i data-test="on" />' },
    })

    expect(wrapper.find('[data-testid="gr-switch-thumb-icon"]').exists()).toBe(true)

    await wrapper.setProps({ modelValue: false })
    expect(wrapper.find('[data-testid="gr-switch-thumb-icon"]').exists()).toBe(false)
  })

  it('лоадер вытесняет знак: «меняется» важнее, чем «каким стало»', () => {
    const wrapper = mount(GrSwitch, {
      props: { modelValue: true, loading: true },
      slots: { 'checked-icon': '<i data-test="on" />' },
    })

    expect(wrapper.find('[data-gr-switch-spinner]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="gr-switch-thumb-icon"]').exists()).toBe(false)
  })

  it('размер знака идёт за ступенью и совпадает со спиннером', () => {
    for (const size of GR_COMPONENT_SIZES) {
      const icon = mount(GrSwitch, {
        props: { modelValue: true, size },
        slots: { 'checked-icon': '<i />' },
      }).get('[data-testid="gr-switch-thumb-icon"]')

      const spinner = mount(GrSwitch, {
        props: { modelValue: true, size, loading: true },
      }).get('[data-gr-switch-spinner]')

      const box = (style: Record<string, string>) => [style.width, style.height, style['max-width'], style['max-height']]
      expect(box(lookOf(icon)), size).toEqual(box(lookOf(spinner)))
      expect(lookOf(icon).width, size).toBeDefined()
    }
  })

  it('знак декоративен: он внутри бегунка, а тот скрыт от диктора', () => {
    const wrapper = mount(GrSwitch, {
      props: { modelValue: true, ariaLabel: 'Автосохранение' },
      slots: { 'checked-icon': '<i data-test="on" />' },
    })

    const thumb = wrapper.get('[data-testid="gr-switch-thumb"]')
    expect(thumb.attributes('aria-hidden')).toBe('true')
    expect(thumb.find('[data-testid="gr-switch-thumb-icon"]').exists()).toBe(true)
    // Состояние диктор берёт отсюда, а не из знака.
    expect(wrapper.get('[role="switch"]').attributes('aria-checked')).toBe('true')
    expect(wrapper.get('[role="switch"]').attributes('aria-label')).toBe('Автосохранение')
  })

  it('цвет содержимого приходит хуком в листе, а не инлайном', () => {
    const wrapper = mount(GrSwitch, {
      props: { modelValue: true },
      slots: { 'checked-icon': '<i />' },
    })
    const icon = wrapper.get('[data-testid="gr-switch-thumb-icon"]')

    // Инлайн победил бы CSS потребителя, и переопределить цвет было бы нечем.
    expect(icon.attributes('style')).toBeUndefined()
    expect(lookOf(icon).color).toBe('var(--gr-switch-thumb-fg, var(--gr-muted-fg))')
  })
})
