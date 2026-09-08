import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import { resetGranularityDom } from '../../../testing'
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
  if (!node)
    return null

  const layer = node.closest<HTMLElement>('[data-gr-popover-panel]')
  return layer?.style.display === 'none' ? null : node
}

/** Текст, который диктор прочитает как описание триггера. */
function describedText(wrapper: ReturnType<typeof mountPicker>, ids?: string): string {
  return (ids ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map(id => wrapper.find(`[id="${id}"]`).text())
    .join(' ')
}

function sliderOf(channel: string): HTMLElement | null {
  return document.querySelector(`[data-gr-color-picker-channel="${channel}"] [role="slider"]`)
}

function areaAxis(axis: 'saturation' | 'lightness'): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>(`[data-gr-color-picker-area-axis="${axis}"]`)
}

/** Панель в портале: события шлём настоящему узлу, обёртка его не видит. */
async function pressOn(axis: 'saturation' | 'lightness', key: string): Promise<void> {
  areaAxis(axis)!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  await nextTick()
}

async function open(wrapper: ReturnType<typeof mountPicker>) {
  await wrapper.get('[data-gr-color-picker-trigger]').trigger('click')
  await nextTick()
}

// Панель уезжает в общий портал, и её узлы переживают `unmount`: без уборки
// селекторы по документу находят разметку прошлого теста.
afterEach(resetGranularityDom)

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

    // `aria-readonly` роль `button` не поддерживает (axe: `aria-allowed-attr`),
    // поэтому состояние объявлено описанием триггера.
    const trigger = wrapper.get('[data-gr-color-picker-trigger]')
    expect(trigger.attributes('aria-readonly')).toBeUndefined()
    expect(describedText(wrapper, trigger.attributes('aria-describedby'))).toContain('Read only')

    wrapper.unmount()
  })

  it('обязательность объявлена описанием, а не запрещённым атрибутом', () => {
    const wrapper = mountPicker({ required: true })
    const trigger = wrapper.get('[data-gr-color-picker-trigger]')

    expect(trigger.attributes('aria-required')).toBeUndefined()
    expect(describedText(wrapper, trigger.attributes('aria-describedby'))).toContain('required')

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

  /**
   * Пикер — форм-контрол, и его `triggerBaseClass` объявляет `w-full`, как у
   * `GrInput`, `GrSelect` и `GrNumberInput`. Но обёртка `GrPopover` по умолчанию
   * `inline-block` и обжимает содержимое, поэтому `w-full` резолвился
   * относительно неё: в поле формы шириной 384px пикер рисовался на 113px.
   */
  it('триггер занимает всю ширину поля, как остальные форм-контролы', () => {
    const wrapper = mountPicker()

    const trigger = wrapper.get('[data-gr-popover-trigger]')
    expect(trigger.classes()).toContain('w-full')
    expect(trigger.classes()).not.toContain('inline-block')
  })

  describe('вид «область»', () => {
    it('по умолчанию области нет: вид меняется пропом, а не молча', async () => {
      const wrapper = mountPicker()
      await open(wrapper)

      expect(document.querySelector('[data-gr-color-picker-area]')).toBeNull()
      expect(sliderOf('saturation')).not.toBeNull()
      expect(sliderOf('lightness')).not.toBeNull()

      wrapper.unmount()
    })

    it('область заменяет бегунки S и L, но не оттенок', async () => {
      const wrapper = mountPicker({ view: 'area' })
      await open(wrapper)

      expect(document.querySelector('[data-gr-color-picker-area]')).not.toBeNull()
      expect(sliderOf('saturation')).toBeNull()
      expect(sliderOf('lightness')).toBeNull()
      expect(sliderOf('hue')).not.toBeNull()

      wrapper.unmount()
    })

    /**
     * Главное, ради чего область собрана именно так: у каждой оси настоящий
     * `input[type=range]` со своим именем и значением. Роль-виджет на обёртке
     * объявила бы их презентационными, и диктор потерял бы оба.
     */
    it('у каждой оси настоящее поле диапазона со своим именем', async () => {
      const wrapper = mountPicker({ view: 'area' })
      await open(wrapper)

      const area = document.querySelector('[data-gr-color-picker-area]')!
      expect(area.getAttribute('role')).toBe('group')

      const s = areaAxis('saturation')!
      const l = areaAxis('lightness')!

      expect(s.type).toBe('range')
      expect(l.type).toBe('range')
      expect(s.getAttribute('aria-label')).toBe('Saturation')
      expect(l.getAttribute('aria-label')).toBe('Lightness')
      // В таб-порядке остаются: фокус показывает обёртка через `focus-within`.
      expect(s.getAttribute('tabindex')).toBeNull()
      expect(s.getAttribute('aria-hidden')).toBeNull()

      wrapper.unmount()
    })

    it('модель расходится по осям, а ручка стоит на своём месте', async () => {
      // hsl(217 91% 60%) — синий из `BLUE`.
      const wrapper = mountPicker({ view: 'area' })
      await open(wrapper)

      const s = Number(areaAxis('saturation')!.value)
      const l = Number(areaAxis('lightness')!.value)
      expect(s).toBeGreaterThan(80)
      expect(l).toBeGreaterThan(50)

      const thumb = document.querySelector<HTMLElement>('[data-gr-color-picker-area-thumb]')!
      expect(thumb.style.left).toBe(`${s}%`)
      // Светлота инвертирована: белое вверху.
      expect(thumb.style.top).toBe(`${100 - l}%`)
      expect(thumb.getAttribute('aria-hidden')).toBe('true')

      wrapper.unmount()
    })

    it('горизонталь двигает насыщенность, вертикаль — светлоту, и цвет уходит в модель', async () => {
      const wrapper = mountPicker({ view: 'area' })
      await open(wrapper)

      const before = Number(areaAxis('saturation')!.value)
      await pressOn('saturation', 'ArrowLeft')

      expect(Number(areaAxis('saturation')!.value)).toBe(before - 1)
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()

      const lightnessBefore = Number(areaAxis('lightness')!.value)
      await pressOn('saturation', 'ArrowUp')
      expect(Number(areaAxis('lightness')!.value)).toBe(lightnessBefore + 1)

      wrapper.unmount()
    })

    /**
     * Стрелка поперёк оси меняет значение соседнего поля. Без переезда фокуса
     * диктор промолчал бы о том, что изменилось: озвучивает он сфокусированное.
     */
    it('стрелка поперёк оси уводит фокус на поле той оси, что изменилась', async () => {
      const wrapper = mountPicker({ view: 'area' })
      await open(wrapper)

      areaAxis('saturation')!.focus()
      await pressOn('saturation', 'ArrowDown')
      expect(document.activeElement).toBe(areaAxis('lightness'))

      await pressOn('lightness', 'ArrowRight')
      expect(document.activeElement).toBe(areaAxis('saturation'))

      wrapper.unmount()
    })

    it('`readonly` показывает область, но значение с клавиатуры не меняет', async () => {
      const wrapper = mountPicker({ view: 'area', readonly: true })
      await open(wrapper)

      await pressOn('saturation', 'Home')

      expect(wrapper.emitted('update:modelValue')).toBeUndefined()

      wrapper.unmount()
    })
  })

  describe('пипетка', () => {
    it('без поддержки браузера кнопки нет даже при включённом пропе', async () => {
      const wrapper = mountPicker({ eyedropper: true })
      await open(wrapper)

      expect(document.querySelector('[data-gr-color-picker-eyedropper]')).toBeNull()

      wrapper.unmount()
    })

    it('с поддержкой кнопка появляется только по просьбе', async () => {
      Object.defineProperty(window, 'EyeDropper', {
        configurable: true,
        writable: true,
        value: class {
          open = async () => ({ sRGBHex: '#12ab34' })
        },
      })

      const plain = mountPicker()
      await open(plain)
      expect(document.querySelector('[data-gr-color-picker-eyedropper]')).toBeNull()
      plain.unmount()

      const wrapper = mountPicker({ eyedropper: true })
      await open(wrapper)
      const button = document.querySelector('[data-gr-color-picker-eyedropper]')
      expect(button).not.toBeNull()
      expect(button!.getAttribute('aria-label')).toBe('Pick a colour from the screen')

      wrapper.unmount()
      Reflect.deleteProperty(window, 'EyeDropper')
    })

    it('взятый с экрана цвет уходит в модель, а прозрачность остаётся своей', async () => {
      Object.defineProperty(window, 'EyeDropper', {
        configurable: true,
        writable: true,
        value: class {
          open = async () => ({ sRGBHex: '#12ab34' })
        },
      })

      const wrapper = mountPicker({ eyedropper: true, alpha: true, modelValue: '#3b82f680' })
      await open(wrapper)

      document.querySelector<HTMLElement>('[data-gr-color-picker-eyedropper]')!.click()
      await nextTick()
      await nextTick()

      // С экрана приходит уже смешанный цвет: своей прозрачности у него нет.
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['#12ab3480'])

      wrapper.unmount()
      Reflect.deleteProperty(window, 'EyeDropper')
    })
  })
})
