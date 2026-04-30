import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrProgressBar from '../GrProgressBar.vue'

describe('GrProgressBar', () => {
  it('рендерит текущее значение и ширину прогресса', () => {
    const wrapper = mount(GrProgressBar, {
      props: {
        value: 45,
        ariaLabel: 'Upload progress',
      },
    })

    const root = wrapper.get('[role="progressbar"]')
    const fill = wrapper.get('[role="progressbar"] > div')

    expect(root.attributes('aria-label')).toBe('Upload progress')
    expect(root.attributes('aria-valuenow')).toBe('45')
    expect(fill.attributes('style')).toContain('width: 45%;')
  })

  it('клампит значение выше 100', () => {
    const wrapper = mount(GrProgressBar, {
      props: {
        value: 140,
      },
    })

    const root = wrapper.get('[role="progressbar"]')
    const fill = wrapper.get('[role="progressbar"] > div')

    expect(root.attributes('aria-valuenow')).toBe('100')
    expect(fill.attributes('style')).toContain('width: 100%;')
  })

  it('сбрасывает NaN и отрицательные значения к нулю', async () => {
    const wrapper = mount(GrProgressBar, {
      props: {
        value: Number.NaN,
      },
    })

    const root = wrapper.get('[role="progressbar"]')
    const fill = wrapper.get('[role="progressbar"] > div')

    expect(root.attributes('aria-valuenow')).toBe('0')
    expect(fill.attributes('style')).toContain('width: 0%;')

    await wrapper.setProps({ value: -5 })

    expect(root.attributes('aria-valuenow')).toBe('0')
    expect(fill.attributes('style')).toContain('width: 0%;')
  })
})