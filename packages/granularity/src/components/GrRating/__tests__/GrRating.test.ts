import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrRating from '../GrRating.vue'

describe('GrRating', () => {
  it('рендерит шкалу с WAI-ARIA slider-контрактом', () => {
    const wrapper = mount(GrRating, { props: { modelValue: 3, max: 5, ariaLabel: 'Оценка отеля' } })
    const scale = wrapper.get('[data-testid="gr-rating-scale"]')

    expect(scale.attributes('role')).toBe('slider')
    expect(scale.attributes('aria-valuemin')).toBe('0')
    expect(scale.attributes('aria-valuemax')).toBe('5')
    expect(scale.attributes('aria-valuenow')).toBe('3')
    expect(scale.attributes('aria-valuetext')).toBe('3 of 5')
    expect(scale.attributes('aria-label')).toBe('Оценка отеля')
    expect(scale.attributes('tabindex')).toBe('0')
    expect(wrapper.findAll('[data-gr-rating-symbol]')).toHaveLength(5)
  })

  it('заливает символы пропорционально значению (включая половину)', () => {
    const wrapper = mount(GrRating, { props: { modelValue: 2.5, max: 5, allowHalf: true } })
    const widths = wrapper.findAll('[data-gr-rating-fill]').map(el => el.attributes('style'))

    expect(widths[0]).toContain('width: 100%')
    expect(widths[1]).toContain('width: 100%')
    expect(widths[2]).toContain('width: 50%')
    expect(widths[3]).toContain('width: 0%')
  })

  it('клик по символу выставляет оценку', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 0 } })
    await wrapper.get('[data-testid="gr-rating-symbol-2"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([3])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([3])
  })

  it('clearable: повторный клик по текущей оценке сбрасывает её', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 3, clearable: true } })
    await wrapper.get('[data-testid="gr-rating-symbol-2"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
  })

  it('стрелки меняют оценку на шаг, Home/End — к границам', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 2, max: 5 } })
    const scale = wrapper.get('[data-testid="gr-rating-scale"]')

    await scale.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([3])

    await scale.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])

    await scale.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])

    await scale.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([5])
  })

  it('allowHalf: шаг клавиатуры — половина символа', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 2, allowHalf: true } })
    await wrapper.get('[data-testid="gr-rating-scale"]').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2.5])
  })

  it('значение клампится границами шкалы', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 5, max: 5 } })
    await wrapper.get('[data-testid="gr-rating-scale"]').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue') ?? []).toHaveLength(0)
    expect(wrapper.emitted('change')?.at(-1)).toEqual([5])
  })

  it('readonly: показ без ввода — role="img" и оценка в подписи', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 4, readonly: true, ariaLabel: 'Оценка' } })
    const scale = wrapper.get('[data-testid="gr-rating-scale"]')

    expect(scale.attributes('role')).toBe('img')
    expect(scale.attributes('tabindex')).toBeUndefined()
    expect(scale.attributes('aria-label')).toBe('Оценка: 4 of 5')

    await wrapper.get('[data-testid="gr-rating-symbol-0"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('disabled: не реагирует на клик и помечен aria-disabled', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 2, disabled: true } })

    const scale = wrapper.get('[data-testid="gr-rating-scale"]')
    // Отключённый контрол остаётся slider-ом (штатный ARIA-паттерн), но вне таб-порядка.
    expect(scale.attributes('role')).toBe('slider')
    expect(scale.attributes('aria-disabled')).toBe('true')
    expect(scale.attributes('tabindex')).toBe('-1')
    await wrapper.get('[data-testid="gr-rating-symbol-4"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('hover показывает предпросмотр оценки, уход курсора его снимает', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 1 } })

    await wrapper.get('[data-testid="gr-rating-symbol-3"]').trigger('mousemove')
    expect(wrapper.emitted('hoverChange')?.at(-1)).toEqual([4])
    expect(wrapper.get('[data-testid="gr-rating-scale"]').attributes('aria-valuenow')).toBe('4')

    await wrapper.get('[data-gr-rating]').trigger('mouseleave')
    expect(wrapper.emitted('hoverChange')?.at(-1)).toEqual([null])
    expect(wrapper.get('[data-testid="gr-rating-scale"]').attributes('aria-valuenow')).toBe('1')
  })
})
