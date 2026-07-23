import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrSlider from '../GrSlider.vue'

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
      const last = wrapper.emitted('update:modelValue')?.at(-1)?.[0]
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
