import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrSwitch from '../GrSwitch.vue'
import { GR_COMPONENT_SIZES } from '../../shared/sizes'
import { thumbSizes, thumbTranslations, trackSizes } from '../grSwitchStyles'

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
    expect(thumb.attributes('class')).toContain('translate-x-[21px]')
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
    expect(thumb.attributes('class')).toContain('translate-x-[29px]')

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
      attrs: { class: 'my-switch', 'data-test': 'toggle' },
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
 * Арифметика зазоров бегунка — таблицей, а не глазами.
 *
 * Зазоры расходились: у `xs`/`sm` справа оставался 1px против 2px слева, у `lg` —
 * 2 против 3, верно было только у `md`. Считаем заново из тех же карт, что и
 * рендер: смена любой ступени размера обязана сразу показать разъезд.
 */
describe('GrSwitch — геометрия бегунка', () => {
  /** `h-6` → 24, `w-11` → 44, `translate-x-[21px]` → 21. */
  function pixels(className: string, prefix: 'h-' | 'w-' | 'translate-x-'): number {
    const token = className.split(' ').find(part => part.startsWith(prefix))
    if (!token) throw new Error(`нет класса ${prefix}* в «${className}»`)

    const value = token.slice(prefix.length)
    const arbitrary = value.match(/^\[(\d+(?:\.\d+)?)px\]$/)
    if (arbitrary) return Number.parseFloat(arbitrary[1])

    // Шкала Uno: 1 = 0.25rem = 4px.
    return Number.parseFloat(value) * 4
  }

  it('зазор одинаков слева, справа и по вертикали на каждой ступени', () => {
    const rows = GR_COMPONENT_SIZES.map((size) => {
      // Дорожка — `border-box` с рамкой 1px, бегунок двигается внутри content-box.
      const trackWidth = pixels(trackSizes[size], 'w-') - 2
      const trackHeight = pixels(trackSizes[size], 'h-') - 2
      const thumb = pixels(thumbSizes[size], 'w-')

      const rest = pixels(thumbTranslations[size].unchecked, 'translate-x-')
      const end = pixels(thumbTranslations[size].checked, 'translate-x-')

      return {
        size,
        left: rest,
        right: trackWidth - thumb - end,
        vertical: (trackHeight - pixels(thumbSizes[size], 'h-')) / 2,
      }
    })

    for (const row of rows) {
      expect(row.right, `${row.size}: зазор справа против зазора слева`).toBe(row.left)
      expect(row.vertical, `${row.size}: зазор по вертикали против горизонтального`).toBe(row.left)
    }
  })

  it('бегунок не вылезает за дорожку ни в покое, ни в крайнем положении', () => {
    for (const size of GR_COMPONENT_SIZES) {
      const trackWidth = pixels(trackSizes[size], 'w-') - 2
      const thumb = pixels(thumbSizes[size], 'w-')
      const end = pixels(thumbTranslations[size].checked, 'translate-x-')

      expect(pixels(thumbTranslations[size].unchecked, 'translate-x-'), size).toBeGreaterThan(0)
      expect(end + thumb, size).toBeLessThanOrEqual(trackWidth)
    }
  })
})
