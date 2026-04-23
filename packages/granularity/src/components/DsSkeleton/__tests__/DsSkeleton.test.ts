import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DsSkeleton from '../DsSkeleton.vue'

describe('DsSkeleton', () => {
  it('использует дефолтные размеры и скругление', () => {
    const wrapper = mount(DsSkeleton)

    expect(wrapper.attributes('style')).toContain('height: 12px;')
    expect(wrapper.attributes('style')).toContain('width: 100%;')
    expect(wrapper.attributes('style')).toContain('border-radius: 9999px;')
  })

  it('позволяет переопределить размеры и border radius', () => {
    const wrapper = mount(DsSkeleton, {
      props: {
        height: '24px',
        width: '8rem',
        rounded: '12px',
      },
    })

    expect(wrapper.attributes('style')).toContain('height: 24px;')
    expect(wrapper.attributes('style')).toContain('width: 8rem;')
    expect(wrapper.attributes('style')).toContain('border-radius: 12px;')
  })
})