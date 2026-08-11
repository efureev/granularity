import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrColorPicker from '../GrColorPicker.vue'

const BLUE = '#3b82f6'

function mountPicker(props: Record<string, unknown> = {}) {
  return mount(GrColorPicker, {
    props: { modelValue: BLUE, ...props },
    attachTo: document.body,
  })
}

/**
 * Панель уезжает в портал, поэтому ищем её по документу. `GrPopover` прячет её
 * через `v-show`, то есть узел существует и закрытым — видимость проверяем явно.
 */
function panel(): HTMLElement | null {
  const node = document.querySelector<HTMLElement>('[data-gr-color-picker-panel]')
  if (!node) return null

  const layer = node.closest<HTMLElement>('[data-gr-popover-panel]')
  return layer?.style.display === 'none' ? null : node
}

function sliderOf(channel: string): HTMLElement | null {
  return document.querySelector(`[data-gr-color-picker-channel="${channel}"] [role="slider"]`)
}

async function open(wrapper: ReturnType<typeof mountPicker>) {
  await wrapper.get('[data-gr-color-picker-trigger]').trigger('click')
  await nextTick()
}

describe('GrColorPicker', () => {
  it('показывает значение и образец текущего цвета', () => {
    const wrapper = mountPicker()

    expect(wrapper.get('[data-gr-color-picker-trigger]').text()).toContain(BLUE)
    // Образец декоративен: цвет уже назван текстом рядом.
    expect(wrapper.get('[data-gr-color-picker-swatch]').attributes('aria-hidden')).toBe('true')

    wrapper.unmount()
  })

  it('триггер объявляет панель и её состояние', async () => {
    const wrapper = mountPicker()
    const trigger = wrapper.get('[data-gr-color-picker-trigger]')

    expect(trigger.attributes('aria-haspopup')).toBe('dialog')
    expect(trigger.attributes('aria-expanded')).toBe('false')

    await open(wrapper)
    expect(wrapper.get('[data-gr-color-picker-trigger]').attributes('aria-expanded')).toBe('true')
    expect(panel()).not.toBeNull()

    wrapper.unmount()
  })

  it('каждый канал — настоящий слайдер со своим именем', async () => {
    const wrapper = mountPicker({ alpha: true })
    await open(wrapper)

    for (const [channel, label] of [
      ['hue', 'Hue'],
      ['saturation', 'Saturation'],
      ['lightness', 'Lightness'],
      ['alpha', 'Opacity'],
    ] as const) {
      const slider = sliderOf(channel)
      expect(slider, channel).not.toBeNull()
      expect(slider!.getAttribute('aria-label'), channel).toBe(label)
    }

    wrapper.unmount()
  })

  it('градиенты дорожек висят на самой панели', async () => {
    // Панель уезжает в портал: с корня переменные до неё не наследуются.
    const wrapper = mountPicker({ alpha: true })
    await open(wrapper)

    const style = panel()!.style
    for (const channel of ['hue', 'saturation', 'lightness', 'alpha'])
      expect(style.getPropertyValue(`--gr-color-picker-track-${channel}`), channel).not.toBe('')

    wrapper.unmount()
  })

  it('модель расходится по каналам', async () => {
    const wrapper = mountPicker()
    await open(wrapper)

    // #3b82f6 — это 217°, 91 %, 60 %.
    expect(sliderOf('hue')!.getAttribute('aria-valuenow')).toBe('217')
    expect(sliderOf('saturation')!.getAttribute('aria-valuenow')).toBe('91')
    expect(sliderOf('lightness')!.getAttribute('aria-valuenow')).toBe('60')

    wrapper.unmount()
  })

  it('движение канала отдаёт новый hex', async () => {
    const wrapper = mountPicker()
    await open(wrapper)

    sliderOf('hue')!.focus()
    sliderOf('hue')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await nextTick()

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toHaveLength(1)
    expect(emitted![0][0]).toMatch(/^#[0-9a-f]{6}$/)
    expect(emitted![0][0]).not.toBe(BLUE)
    // `change` идёт в паре: контракт форм-контрола пакета.
    expect(wrapper.emitted('change')).toHaveLength(1)

    wrapper.unmount()
  })

  it('оттенок серого не сбрасывается на 0° — состояние живёт отдельно от hex', async () => {
    // У серого нет оттенка, и без собственного состояния бегунок прыгал бы назад.
    const wrapper = mountPicker({ modelValue: '#808080' })
    await open(wrapper)

    const hue = sliderOf('hue')!
    hue.focus()
    for (let i = 0; i < 5; i++) {
      hue.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      await nextTick()
    }

    expect(sliderOf('hue')!.getAttribute('aria-valuenow')).toBe('5')

    wrapper.unmount()
  })

  it('alpha добавляет канал и восьмизначную форму', async () => {
    const plain = mountPicker()
    await open(plain)
    expect(sliderOf('alpha')).toBeNull()
    expect(plain.get('[data-gr-color-picker-trigger]').text()).toContain('#3b82f6')
    plain.unmount()

    const withAlpha = mountPicker({ modelValue: '#3b82f6cc', alpha: true })
    await open(withAlpha)
    expect(sliderOf('alpha')).not.toBeNull()
    expect(withAlpha.get('[data-gr-color-picker-trigger]').text()).toContain('#3b82f6cc')

    withAlpha.unmount()
  })

  it('невалидная модель не роняет компонент', () => {
    const wrapper = mountPicker({ modelValue: 'не цвет' })

    expect(wrapper.get('[data-gr-color-picker-trigger]').text()).toContain('#000000')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('поле hex коммитит валидное значение и откатывает мусор', async () => {
    const wrapper = mountPicker()
    await open(wrapper)

    const input = document.querySelector<HTMLInputElement>('input[data-gr-color-picker-hex]')!

    input.value = '#ff0088'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('#ff0088')

    input.value = 'мусор'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
    await nextTick()
    await nextTick()
    // Невалидный текст в поле показывал бы цвет, которого нет.
    expect(input.value).toBe('#ff0088')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)

    wrapper.unmount()
  })

  it('пресеты выбираются и объявляют выбранный', async () => {
    const wrapper = mountPicker({ presets: ['#ff0000', BLUE, 'не цвет'] })
    await open(wrapper)

    const presets = document.querySelectorAll('[data-gr-color-picker-preset]')
    // Невалидный пресет отсеивается, а не рисуется пустым квадратом.
    expect(presets).toHaveLength(2)
    expect(presets[1].getAttribute('aria-pressed')).toBe('true')
    expect(presets[0].getAttribute('aria-pressed')).toBe('false')

    ;(presets[0] as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('#ff0000')

    wrapper.unmount()
  })

  it('readonly показывает цвет, но не меняет его', async () => {
    const wrapper = mountPicker({ readonly: true, presets: ['#ff0000'] })
    await open(wrapper)

    ;(document.querySelector('[data-gr-color-picker-preset]') as HTMLElement).click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.get('[data-gr-color-picker-trigger]').attributes('aria-readonly')).toBe('true')

    wrapper.unmount()
  })

  it('disabled не открывает панель', async () => {
    const wrapper = mountPicker({ disabled: true })
    await open(wrapper)

    expect(panel()).toBeNull()
    expect(wrapper.get('[data-gr-color-picker-trigger]').attributes('disabled')).toBeDefined()

    wrapper.unmount()
  })

  it('name отдаёт значение в нативную форму скрытым полем', () => {
    const wrapper = mountPicker({ name: 'brand', modelValue: '#ff0088' })

    const hidden = wrapper.get('input[type="hidden"]')
    expect(hidden.attributes('name')).toBe('brand')
    expect(hidden.attributes('value')).toBe('#ff0088')

    wrapper.unmount()
  })

  it('v-model:open ведёт панель снаружи', async () => {
    const wrapper = mountPicker({ open: false })

    await wrapper.get('[data-gr-color-picker-trigger]').trigger('click')
    await nextTick()

    // Управляемый режим: панель откроется, только когда проп вернётся `true`.
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(panel()).toBeNull()

    await wrapper.setProps({ open: true })
    await nextTick()
    await nextTick()
    expect(panel()).not.toBeNull()

    wrapper.unmount()
  })
})
