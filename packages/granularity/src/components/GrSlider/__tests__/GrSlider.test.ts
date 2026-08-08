import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import { GRANULARITY_I18N_KEY } from '../../../i18n/adapter'
import GrSlider from '../GrSlider.vue'
import type { GrSliderModelValue } from '../GrSlider.vue'

describe('GrSlider', () => {
  it('рендерит бегунок с WAI-ARIA slider-контрактом', () => {
    const wrapper = mount(GrSlider, {
      props: { modelValue: 40, min: 0, max: 100, ariaLabel: 'Volume' },
    })
    const thumb = wrapper.get('[role="slider"]')
    expect(thumb.attributes('aria-valuemin')).toBe('0')
    expect(thumb.attributes('aria-valuemax')).toBe('100')
    expect(thumb.attributes('aria-valuenow')).toBe('40')
    expect(thumb.attributes('aria-orientation')).toBe('horizontal')
    expect(thumb.attributes('aria-label')).toBe('Volume')
    expect(thumb.attributes('tabindex')).toBe('0')
  })

  it('позиционирует fill по значению', () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 25, min: 0, max: 100 } })
    const fill = wrapper.get('[data-gr-slider-fill]')
    expect(fill.attributes('style')).toContain('right: 75%')
  })

  it('стрелки меняют значение на step, Home/End — к границам', async () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 50, min: 0, max: 100, step: 5 } })
    const thumb = wrapper.get('[role="slider"]')

    await thumb.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([55])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([55])

    await thumb.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([45])

    await thumb.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])

    await thumb.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([100])
  })

  it('PageUp/PageDown делают крупный шаг и клампятся границами', async () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 5, min: 0, max: 100, step: 1 } })
    const thumb = wrapper.get('[role="slider"]')

    await thumb.trigger('keydown', { key: 'PageUp' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([15])

    await thumb.trigger('keydown', { key: 'PageDown' })
    await thumb.trigger('keydown', { key: 'PageDown' })
    // 15 → 5 → clamp(−5) → 0
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
  })

  it('range: два бегунка, значения не перепрыгивают друг друга', async () => {
    const wrapper = mount(GrSlider, {
      props: { modelValue: [20, 60], range: true, min: 0, max: 100, step: 10, ariaLabel: 'Price' },
    })
    const thumbs = wrapper.findAll('[role="slider"]')
    expect(thumbs).toHaveLength(2)
    // Верхняя граница нижнего бегунка = значение верхнего.
    expect(thumbs[0].attributes('aria-valuemax')).toBe('60')
    // Нижняя граница верхнего бегунка = значение нижнего.
    expect(thumbs[1].attributes('aria-valuemin')).toBe('20')

    // Двигаем нижний бегунок вверх за пределы верхнего — упирается в 60.
    // Slider контролируемый: синхронизируем модель после каждого шага (как v-model).
    for (let i = 0; i < 10; i++) {
      await thumbs[0].trigger('keydown', { key: 'ArrowRight' })
      const last = wrapper.emitted<[GrSliderModelValue]>('update:modelValue')?.at(-1)?.[0]
      await wrapper.setProps({ modelValue: last })
    }
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[60, 60]])
  })

  it('снапит значение к step', async () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 43, min: 0, max: 100, step: 10 } })
    const thumb = wrapper.get('[role="slider"]')
    // 43 снапится к 40 при рендере.
    expect(thumb.attributes('aria-valuenow')).toBe('40')
  })

  it('рендерит метки делений', () => {
    const wrapper = mount(GrSlider, {
      props: { modelValue: 0, min: 0, max: 100, marks: { 0: 'Low', 50: 'Mid', 100: 'High' } },
    })
    const labels = wrapper.findAll('[data-gr-slider-mark-label]').map(w => w.text())
    expect(labels).toEqual(['Low', 'Mid', 'High'])
  })

  it('disabled: бегунок вынут из таба и не реагирует на клавиши', async () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 50, disabled: true } })
    const thumb = wrapper.get('[role="slider"]')
    expect(thumb.attributes('tabindex')).toBe('-1')
    expect(thumb.attributes('aria-disabled')).toBe('true')
    await thumb.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('tooltip показывается по фокусу при showTooltip', async () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 30, showTooltip: true, formatTooltip: (v: number) => `${v}%` } })
    const thumb = wrapper.get('[role="slider"]')
    expect(wrapper.find('[data-gr-slider-tooltip]').exists()).toBe(false)
    await thumb.trigger('focus')
    expect(wrapper.get('[data-gr-slider-tooltip]').text()).toBe('30%')
  })
})

/**
 * jsdom не знает `PointerEvent`, а `clientX`/`clientY` у события только на
 * чтение — VTU через `trigger` их не подставит. Диспатчим `MouseEvent` руками.
 */
function pointerDown(wrapper: ReturnType<typeof mount>, init: MouseEventInit): void {
  const track = wrapper.get('[data-gr-slider-track]').element
  track.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, ...init }))
}

/** Дорожке в jsdom нужна геометрия: без неё любое значение схлопнется в `min`. */
function stubTrackRect(wrapper: ReturnType<typeof mount>, rect: Partial<DOMRect>): void {
  const track = wrapper.get('[data-gr-slider-track]').element
  track.getBoundingClientRect = (): DOMRect => ({
    left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200, x: 0, y: 0,
    toJSON: () => ({}), ...rect,
  })
}

describe('GrSlider — доступное имя и valuetext', () => {
  it('границы диапазона называются словами из локали', () => {
    const i18n = {
      t: (key: string) => ({ 'gr.slider.min': 'минимум', 'gr.slider.max': 'максимум' }[key] ?? key),
    }

    const wrapper = mount(GrSlider, {
      props: { modelValue: [20, 80] as GrSliderModelValue, range: true, ariaLabel: 'Громкость' },
      global: { provide: { [GRANULARITY_I18N_KEY as symbol]: i18n } },
    })

    const labels = wrapper.findAll('[role="slider"]').map(thumb => thumb.attributes('aria-label'))
    expect(labels).toEqual(['Громкость (минимум)', 'Громкость (максимум)'])
  })

  it('aria-valuetext появляется только при своём формате', () => {
    const plain = mount(GrSlider, { props: { modelValue: 1200 } })
    expect(plain.get('[role="slider"]').attributes('aria-valuetext')).toBeUndefined()

    const formatted = mount(GrSlider, {
      props: { modelValue: 1200, max: 2000, formatTooltip: (value: number) => `$${value}` },
    })
    expect(formatted.get('[role="slider"]').attributes('aria-valuetext')).toBe('$1200')
  })
})

describe('GrSlider — указатель', () => {
  it('схлопнувшийся диапазон разводится кликом по дорожке', async () => {
    const wrapper = mount(GrSlider, {
      props: { modelValue: [50, 50] as GrSliderModelValue, range: true },
      attachTo: document.body,
    })
    stubTrackRect(wrapper, { width: 100 })

    // Клик правее обоих бегунков обязан тянуть верхний: иначе нижний упрётся в
    // верхний и диапазон останется схлопнутым.
    pointerDown(wrapper, { clientX: 80 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[50, 80]])
    wrapper.unmount()
  })

  it('неосновные кнопки мыши перетаскивание не начинают', async () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 10 }, attachTo: document.body })
    stubTrackRect(wrapper, { width: 100 })

    pointerDown(wrapper, { clientX: 80, button: 2 })
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()

    pointerDown(wrapper, { clientX: 80 })
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([80])
    wrapper.unmount()
  })
})

describe('GrSlider — вертикальная ориентация', () => {
  it('объявляет ориентацию и считает значение снизу вверх', async () => {
    const wrapper = mount(GrSlider, {
      props: { modelValue: 0, orientation: 'vertical' },
      attachTo: document.body,
    })
    stubTrackRect(wrapper, { top: 0, height: 100 })

    expect(wrapper.get('[role="slider"]').attributes('aria-orientation')).toBe('vertical')
    expect(wrapper.attributes('data-orientation')).toBe('vertical')

    // Клик у верхнего края — это максимум: минимум в вертикали внизу.
    pointerDown(wrapper, { clientY: 10 })
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([90])

    wrapper.unmount()
  })

  it('бегунок и заливка позиционируются вдоль вертикали', () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 25, orientation: 'vertical' } })

    expect(wrapper.get('[data-gr-slider-thumb]').attributes('style')).toContain('bottom: 25%')
    expect(wrapper.get('[data-gr-slider-fill]').attributes('style')).toContain('top: 75%')
  })
})

describe('GrSlider — жест на таче', () => {
  it('дорожка запрещает браузерный pan: touch-action у трека', () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 10 } })
    // Без этого вертикальный свайп по бегунку уходит в скролл страницы, браузер
    // шлёт pointercancel — и слайдер пальцем неуправляем.
    expect(wrapper.get('[data-gr-slider-track]').classes()).toContain('[touch-action:none]')
  })

  it('pointercancel обрывает жест: lazy-черновик откатывается без эмита', async () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 10, lazy: true }, attachTo: document.body })
    stubTrackRect(wrapper, { width: 100 })

    pointerDown(wrapper, { clientX: 60 })
    await nextTick()
    expect(wrapper.get('[data-gr-slider-thumb]').attributes('style')).toContain('left: 60%')

    window.dispatchEvent(new Event('pointercancel'))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(wrapper.emitted('change')).toBeFalsy()
    expect(wrapper.get('[data-gr-slider-thumb]').attributes('style')).toContain('left: 10%')

    // Оборванный жест не продолжается движением указателя.
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 90 }))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()

    wrapper.unmount()
  })
})

describe('GrSlider — lazy', () => {
  it('перетаскивание не отдаёт значение наружу до отпускания', async () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 10, lazy: true }, attachTo: document.body })
    stubTrackRect(wrapper, { width: 100 })

    pointerDown(wrapper, { clientX: 60 })
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    // Бегунок при этом уже уехал: жест ведёт черновое значение.
    expect(wrapper.get('[data-gr-slider-thumb]').attributes('style')).toContain('left: 60%')

    window.dispatchEvent(new Event('pointerup'))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([60])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([60])
    wrapper.unmount()
  })

  it('клавиатура коммитит сразу даже при lazy', async () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 10, lazy: true } })

    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([11])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([11])
  })
})

describe('GrSlider — оформление и размеры', () => {
  it('disabled гасится токенами, а не прозрачностью', () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 30, disabled: true, marks: [0, 50, 100] } })

    expect(wrapper.html()).not.toMatch(/opacity-\d/)
    expect(wrapper.get('[data-gr-slider-fill]').classes()).toContain('bg-[var(--gr-disabled-fg)]')
    expect(wrapper.get('[data-gr-slider-mark-label]').classes()).toContain('text-[var(--gr-disabled-fg)]')
  })

  it('подписи меток спрятаны от диктора', () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 30, marks: { 0: 'Тихо', 100: 'Громко' } } })

    for (const label of wrapper.findAll('[data-gr-slider-mark-label]'))
      expect(label.attributes('aria-hidden')).toBe('true')
  })

  it('xs из GrConfigProvider доходит до слайдера', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrSlider },
      template: `
        <GrConfigProvider size="xs">
          <GrSlider :model-value="10" />
        </GrConfigProvider>
      `,
    })

    const track = mount(Harness).get('[data-gr-slider-track]')
    expect(track.classes()).toContain('h-[var(--gr-slider-track-height,0.1875rem)]')
  })
})

describe('GrSlider — name (нативная форма)', () => {
  it('с `name` рендерит hidden input; range — два с одним именем', async () => {
    const single = mount(GrSlider, { props: { modelValue: 30, name: 'volume', ariaLabel: 'Volume' } })
    const hidden = single.get('input[type="hidden"]')
    expect(hidden.attributes('name')).toBe('volume')
    expect((hidden.element as HTMLInputElement).value).toBe('30')
    single.unmount()

    const range = mount(GrSlider, {
      props: { modelValue: [20, 80] as GrSliderModelValue, range: true, name: 'span', ariaLabel: 'Span' },
    })
    const inputs = range.findAll('input[type="hidden"]')
    expect(inputs).toHaveLength(2)
    expect(inputs.map(i => (i.element as HTMLInputElement).value)).toEqual(['20', '80'])
    expect(inputs.every(i => i.attributes('name') === 'span')).toBe(true)
    range.unmount()
  })

  it('без `name` hidden input отсутствует', () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 30, ariaLabel: 'Volume' } })
    expect(wrapper.find('input[type="hidden"]').exists()).toBe(false)
    wrapper.unmount()
  })
})
