import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrCard from '../GrCard.vue'

describe('GrCard', () => {
  it('рендерит слот и базовые card-классы', () => {
    const wrapper = mount(GrCard, {
      slots: {
        default: '<div>Card content</div>',
      },
    })

    expect(wrapper.text()).toContain('Card content')
    expect(wrapper.attributes('class')).toContain('rounded-[var(--ds-radius-lg)]')
    expect(wrapper.attributes('class')).toContain('border-[var(--brd)]')
    expect(wrapper.attributes('class')).toContain('bg-[var(--card)]')
    expect(wrapper.attributes('class')).toContain('text-[var(--card-fg)]')
  })
})