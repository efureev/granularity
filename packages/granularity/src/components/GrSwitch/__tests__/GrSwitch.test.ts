import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrSwitch from '../GrSwitch.vue'
import { GR_COMPONENT_SIZES } from '../../shared/sizes'
import {
  GR_SWITCH_STATE_TEXT_SIZES,
  SWITCH_THUMB_GAP,
  stateTextAutoPaddings,
  stateTextPaddings,
  stateTextRoom,
  stateTextSizes,
  thumbPositions,
  thumbSizes,
  trackAutoSizes,
  trackSizes,
} from '../grSwitchStyles'

/** `h-6` → 24, `w-11` → 44, `min-w-11` → 44, `pr-[21px]` → 21. */
function pixels(className: string, prefix: 'h-' | 'w-' | 'min-w-' | 'pl-' | 'pr-'): number {
  const token = className.split(' ').find(part => part.startsWith(prefix))
  if (!token)
    throw new Error(`нет класса ${prefix}* в «${className}»`)

  const value = token.slice(prefix.length)
  const arbitrary = value.match(/^\[(\d+(?:\.\d+)?)px\]$/)
  if (arbitrary)
    return Number.parseFloat(arbitrary[1])

  // Шкала Uno: 1 = 0.25rem = 4px.
  return Number.parseFloat(value) * 4
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
    expect(track.attributes('class')).toContain('h-6')
    expect(track.attributes('class')).toContain('w-11')
    expect(track.attributes('style')).toContain('--gr-switch-track-bg: #10b981')
    expect(track.attributes('style')).toContain('--gr-switch-track-brd: #10b981')

    const thumb = wrapper.get('[data-testid="gr-switch-thumb"]')
    expect(thumb.attributes('class')).toContain('-translate-x-full')
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
    expect(track.attributes('class')).toContain('h-7')
    expect(track.attributes('class')).toContain('w-14')

    const thumb = wrapper.get('[data-testid="gr-switch-thumb"]')
    expect(thumb.attributes('class')).toContain('h-6')
    expect(thumb.attributes('class')).toContain('w-6')
    expect(thumb.attributes('class')).toContain('-translate-x-full')

    const label = wrapper.get('[data-gr-switch-label]')
    expect(label.attributes('class')).toContain('text-[length:var(--gr-text-base)]')
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
    expect(button.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)

    // Токен перебивает и кастомный цвет: иначе выключенный выглядел бы рабочим.
    const track = wrapper.get('[data-testid="gr-switch-track"]')
    expect(track.attributes('style')).toContain('--gr-switch-track-bg: var(--gr-disabled-bg)')
    expect(track.attributes('style')).toContain('--gr-switch-track-brd: var(--gr-disabled-brd)')
    expect(wrapper.get('[data-gr-switch-label]').classes()).toContain('text-[var(--gr-disabled-fg)]')
  })

  it('labelPosition разворачивает ряд, не трогая порядок узлов', () => {
    const end = mount(GrSwitch, { props: { modelValue: true }, slots: { default: 'Label' } })
    expect(end.get('[role="switch"]').classes()).not.toContain('flex-row-reverse')

    const start = mount(GrSwitch, {
      props: { modelValue: true, labelPosition: 'start' },
      slots: { default: 'Label' },
    })
    const button = start.get('[role="switch"]')
    expect(button.classes()).toContain('flex-row-reverse')
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
    expect(track.classes()).toContain('h-4')
    expect(track.classes()).toContain('w-7')
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
  it('вертикальный зазор равен константе на каждой ступени', () => {
    for (const size of GR_COMPONENT_SIZES) {
      // Дорожка — `border-box` с рамкой 1px, бегунок центруется в content-box.
      const trackHeight = pixels(trackSizes[size], 'h-') - 2
      const gap = (trackHeight - pixels(thumbSizes[size], 'h-')) / 2

      expect(gap, `${size}: вертикальный зазор`).toBe(SWITCH_THUMB_GAP)
    }
  })

  it('горизонталь не зависит от ширины дорожки', () => {
    expect(thumbPositions.unchecked).toContain(`left-[${SWITCH_THUMB_GAP}px]`)
    // Ровно эта пара и делает возможным `autoWidth`: ни одного числа от ширины.
    expect(thumbPositions.checked).toContain(`left-[calc(100%_-_${SWITCH_THUMB_GAP}px)]`)
    expect(thumbPositions.checked).toContain('-translate-x-full')
    expect(JSON.stringify(thumbPositions)).not.toMatch(/translate-x-\[\d/)
  })

  it('бегунок с зазорами укладывается в дорожку на каждой ступени', () => {
    for (const size of GR_COMPONENT_SIZES) {
      const trackWidth = pixels(trackSizes[size], 'w-') - 2

      expect(pixels(thumbSizes[size], 'w-') + SWITCH_THUMB_GAP * 2, size)
        .toBeLessThanOrEqual(trackWidth)
    }
  })

  it('растущая дорожка берёт ту же ступень нижней границей', () => {
    for (const size of GR_COMPONENT_SIZES) {
      expect(pixels(trackAutoSizes[size], 'min-w-'), size).toBe(pixels(trackSizes[size], 'w-'))
      // Тянется только строка: высота остаётся ступенью.
      expect(pixels(trackAutoSizes[size], 'h-'), size).toBe(pixels(trackSizes[size], 'h-'))
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
    expect(stateText().classes()).toContain('pl-[21px]')

    await wrapper.setProps({ modelValue: true })
    expect(stateText().text()).toBe('ON')
    expect(stateText().classes()).toContain('pr-[21px]')
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
    // В предупреждении числа, а не «не поддерживается»: иначе проп выглядит сломанным.
    expect(warn.mock.calls[0][0]).toContain('17px')
    expect(warn.mock.calls[0][0]).toContain('21px')
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
    expect(stateText().classes()).toContain('text-[var(--gr-switch-state-text-fg,var(--gr-primary-fg))]')

    await wrapper.setProps({ modelValue: false })
    expect(stateText().classes()).toContain('text-[var(--gr-switch-state-text-fg,var(--gr-muted-fg))]')

    await wrapper.setProps({ disabled: true })
    expect(stateText().classes()).toContain('text-[var(--gr-switch-state-text-fg,var(--gr-disabled-fg))]')
  })

  it('кегль берётся ступенью, а не одной константой на обе', () => {
    const md = mount(GrSwitch, { props: { modelValue: true, showStateText: true } })
    const lg = mount(GrSwitch, { props: { modelValue: true, showStateText: true, size: 'lg' } })

    expect(md.get('[data-testid="gr-switch-state-text"]').classes()).toContain(stateTextSizes.md)
    expect(lg.get('[data-testid="gr-switch-state-text"]').classes()).toContain(stateTextSizes.lg)
    expect(stateTextSizes.md).not.toBe(stateTextSizes.lg)
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
 * равен `бегунок + зазор`, а остаток и есть свободная ширина. Считаем заново из
 * `trackSizes`/`thumbSizes`, чтобы смена ступени размера сразу показала, что
 * подпись поехала на бегунок.
 */
describe('GrSwitch — геометрия подписи', () => {
  function room(size: typeof GR_COMPONENT_SIZES[number]): { padding: number, free: number } {
    const trackWidth = pixels(trackSizes[size], 'w-') - 2
    const padding = pixels(thumbSizes[size], 'w-') + SWITCH_THUMB_GAP

    return { padding, free: trackWidth - padding }
  }

  it('отступ равен бегунку с зазором на каждой поддержанной ступени', () => {
    for (const size of GR_SWITCH_STATE_TEXT_SIZES) {
      const { padding } = room(size)

      expect(pixels(stateTextPaddings[size].checked, 'pr-'), size).toBe(padding)
      expect(pixels(stateTextPaddings[size].unchecked, 'pl-'), size).toBe(padding)
    }
  })

  it('таблица свободного места сходится с геометрией дорожки', () => {
    for (const size of GR_COMPONENT_SIZES)
      expect(stateTextRoom[size], size).toBe(room(size).free)
  })

  it('подпись живёт ровно там, где места хватает', () => {
    for (const size of GR_COMPONENT_SIZES) {
      const supported = (GR_SWITCH_STATE_TEXT_SIZES as readonly string[]).includes(size)

      expect(stateTextRoom[size] >= stateTextRoom.md, size).toBe(supported)
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

    expect(track.classes()).toContain('w-11')
    expect(track.classes()).not.toContain('min-w-11')
    // Подпись накрывает дорожку и на её размер не влияет.
    expect(wrapper.get('[data-testid="gr-switch-state-text"]').classes()).toContain('absolute')
  })

  it('autoWidth отдаёт ширину подписи, оставляя ступень нижней границей', () => {
    const wrapper = mount(GrSwitch, {
      props: { modelValue: true, showStateText: true, autoWidth: true },
    })
    const track = wrapper.get('[data-testid="gr-switch-track"]')

    expect(track.classes()).toContain('min-w-11')
    expect(track.classes()).not.toContain('w-11')

    const stateText = wrapper.get('[data-testid="gr-switch-state-text"]')
    expect(stateText.classes()).not.toContain('absolute')
    // Со свободной стороны появляется отступ: центровать текст больше нечем.
    expect(stateText.classes()).toContain('pl-[8px]')
    expect(stateText.classes()).toContain('pr-[29px]')
  })

  it('невидимый дубль держит ширину при переключении', async () => {
    const wrapper = mount(GrSwitch, {
      props: { modelValue: true, showStateText: true, autoWidth: true },
    })
    const ghost = () => wrapper.get('[data-gr-switch-state-text-ghost]')

    // Дубль — всегда противоположное состояние, отсюда максимум из двух ширин.
    expect(ghost().text()).toBe('OFF')
    expect(ghost().classes()).toContain('invisible')

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

    expect(wrapper.get('[data-testid="gr-switch-track"]').classes()).toContain('w-11')
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

    expect(mount(Harness).get('[data-testid="gr-switch-track"]').classes()).toContain('min-w-11')
  })
})

/** Отступы растущей дорожки считаются из той же геометрии, что и фиксированной. */
describe('GrSwitch — геометрия растущей подписи', () => {
  it('со стороны бегунка отступ больше фиксированного ровно на воздух', () => {
    for (const size of GR_SWITCH_STATE_TEXT_SIZES) {
      const air = pixels(stateTextAutoPaddings[size].checked, 'pl-')

      expect(pixels(stateTextAutoPaddings[size].checked, 'pr-'), size)
        .toBe(pixels(stateTextPaddings[size].checked, 'pr-') + air)
      // Воздух одинаков с обеих сторон, иначе подпись стоит не по центру остатка.
      expect(pixels(stateTextAutoPaddings[size].unchecked, 'pr-'), size).toBe(air)
      expect(pixels(stateTextAutoPaddings[size].unchecked, 'pl-'), size)
        .toBe(pixels(stateTextPaddings[size].unchecked, 'pl-') + air)
    }
  })

  it('отступ со стороны бегунка перекрывает сам бегунок с зазором', () => {
    for (const size of GR_SWITCH_STATE_TEXT_SIZES) {
      // Иначе текст лёг бы на бегунок, как только дорожка перестала центровать.
      expect(pixels(stateTextAutoPaddings[size].checked, 'pr-'), size)
        .toBeGreaterThan(pixels(thumbSizes[size], 'w-') + SWITCH_THUMB_GAP)
    }
  })
})
