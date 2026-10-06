import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import GrChip from '../components/GrChip/GrChip.vue'
import GrChipGroup from '../components/GrChipGroup/GrChipGroup.vue'
import GrFileUpload from '../components/GrFileUpload/GrFileUpload.vue'
import GrFormFile from '../components/GrFormFile/GrFormFile.vue'
import GrRating from '../components/GrRating/GrRating.vue'
import GrSlider from '../components/GrSlider/GrSlider.vue'
import GrSwitch from '../components/GrSwitch/GrSwitch.vue'
import GrTransfer from '../components/GrTransfer/GrTransfer.vue'
import { granularityGlobal, resetGranularityDom } from '../testing'

afterEach(resetGranularityDom)

/**
 * `invalid` — визуальное **и** ARIA-состояние ошибки.
 *
 * У слайдера, переключателя, зоны загрузки, рейтинга, переноса, группы чипов и
 * выбора файла проп ставил только `aria-invalid`: глазом ошибку было видно
 * лишь по тексту под полем. Здесь — что каждый контрол красит свою рамку (или
 * заливку) ролью ошибки `--gr-invalid-*`, а недоступность сильнее ошибки.
 */
const INVALID = 'var(--gr-invalid-brd)'

describe('invalid виден глазом', () => {
  describe('GrSlider', () => {
    const mountSlider = (props: Record<string, unknown>) => mount(GrSlider, {
      props: { modelValue: 35, min: 10, max: 100, ariaLabel: 'Качество', ...props },
      global: granularityGlobal(),
    })

    it('заливка и рамка бегунка — ролью ошибки, кольцо фокуса — тоже', () => {
      const wrapper = mountSlider({ invalid: true })

      expect(wrapper.get('[data-gr-slider-fill]').classes()).toContain('bg-[var(--gr-invalid-brd)]')
      const thumb = wrapper.get('[role="slider"]').classes()
      expect(thumb).toContain('border-[var(--gr-invalid-brd)]')
      expect(thumb).toContain('focus-visible:ring-[var(--gr-invalid-ring)]')
      expect(thumb.some(name => name.startsWith('border-[var(--gr-slider-thumb-border'))).toBe(false)
    })

    it('недоступность сильнее ошибки, и рамка бегунка гаснет вместе с заливкой', () => {
      const wrapper = mountSlider({ invalid: true, disabled: true, showTooltip: 'always' })
      const thumb = wrapper.get('[role="slider"]').classes()

      expect(wrapper.get('[data-gr-slider-fill]').classes()).toContain('bg-[var(--gr-disabled-fg)]')
      expect(thumb).toContain('border-[var(--gr-disabled-fg)]')
      // Рамка акцента на том же узле решалась порядком утилит — и побеждала.
      expect(thumb.filter(name => name.startsWith('border-[')).length).toBe(1)
      expect(wrapper.get('[data-gr-slider-tooltip]').classes()).toContain('bg-[var(--gr-disabled-bg)]')
    })

    it('обычный слайдер — акцентом, как раньше', () => {
      const wrapper = mountSlider({})

      expect(wrapper.get('[data-gr-slider-fill]').classes()).toContain('bg-[var(--gr-slider-fill,var(--gr-primary))]')
      expect(wrapper.get('[role="slider"]').classes()).toContain('border-[var(--gr-slider-thumb-border,var(--gr-slider-fill,var(--gr-primary)))]')
    })
  })

  it('GrSwitch: рамка дорожки', () => {
    const wrapper = mount(GrSwitch, { props: { modelValue: false, invalid: true, ariaLabel: 'Условия' }, global: granularityGlobal() })

    expect(wrapper.get('[data-gr-switch-track]').attributes('style')).toContain(`--gr-switch-track-brd: ${INVALID}`)
  })

  it('GrFileUpload: рамка зоны, а сброс поверх сильнее ошибки', () => {
    const wrapper = mount(GrFileUpload, { props: { invalid: true }, global: granularityGlobal() })
    const zone = wrapper.get('[data-gr-file-upload]').classes()

    expect(zone).toContain('border-[var(--gr-invalid-brd)]')
    expect(zone).not.toContain('border-[var(--gr-brd)]')
  })

  it('GrRating: пустые символы', () => {
    const wrapper = mount(GrRating, { props: { modelValue: 0, invalid: true, ariaLabel: 'Оценка' }, global: granularityGlobal() })

    expect(wrapper.get('[data-gr-rating]').attributes('style')).toContain(`--gr-rating-void-color: ${INVALID}`)
  })

  it('GrTransfer: рамка списка выбранного', () => {
    const wrapper = mount(GrTransfer, {
      props: { items: [{ key: 'a', label: 'Чтение' }], modelValue: [], invalid: true, ariaLabel: 'Права' },
      global: granularityGlobal(),
    })

    expect(wrapper.get('[data-gr-transfer-panel="target"]').attributes('style')).toContain(`border-color: ${INVALID}`)
    expect(wrapper.get('[data-gr-transfer-panel="source"]').attributes('style') ?? '').not.toContain('border-color')
  })

  it('GrChipGroup: рамка невыбранных чипов', () => {
    const wrapper = mount(GrChipGroup, {
      props: { modelValue: [], invalid: true, ariaLabel: 'Теги' },
      slots: { default: () => [h(GrChip, { value: 'a', label: 'Баг' }), h(GrChip, { value: 'b', label: 'Идея' })] },
      global: granularityGlobal(),
    })

    for (const chip of wrapper.findAll('[data-gr-chip]'))
      expect(chip.attributes('style')).toContain(`border-color: ${INVALID}`)
  })

  it('GrFormFile: кнопка выбора — контуром ошибки', () => {
    const wrapper = mount(GrFormFile, { props: { modelValue: null, invalid: true }, global: granularityGlobal() })
    const button = wrapper.get('[data-gr-form-file-upload-btn]').classes().join(' ')

    expect(button).toContain('danger')
  })
})

describe('GrSlider: недоступный слайдер значение не отправляет', () => {
  it.each([
    ['одиночный', { modelValue: 35 }],
    ['диапазон', { modelValue: [20, 60], range: true }],
  ] as [string, Record<string, unknown>][])('%s', (_name, props) => {
    const form = document.createElement('form')
    document.body.append(form)
    const enabled = mount(GrSlider, { props: { modelValue: 0, ...props, name: 'quality', ariaLabel: 'Качество' }, attachTo: form, global: granularityGlobal() })
    expect(new FormData(form).getAll('quality').length).toBeGreaterThan(0)
    enabled.unmount()

    const disabled = mount(GrSlider, { props: { modelValue: 0, ...props, name: 'quality', ariaLabel: 'Качество', disabled: true }, attachTo: form, global: granularityGlobal() })
    expect(new FormData(form).getAll('quality')).toEqual([])
    disabled.unmount()
    form.remove()
  })
})
