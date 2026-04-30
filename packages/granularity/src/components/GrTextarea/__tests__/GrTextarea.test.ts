import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrTextarea from '../GrTextarea.vue'

describe('GrTextarea', () => {
  it('эмитит update:modelValue при вводе', async () => {
    const wrapper = mount(GrTextarea, {
      props: {
        modelValue: 'hello',
      },
    })

    await wrapper.get('textarea').setValue('updated')

    expect(wrapper.emitted('update:modelValue')).toEqual([['updated']])
  })

  it('использует danger-state при invalid=true независимо от state', () => {
    const wrapper = mount(GrTextarea, {
      props: {
        modelValue: '',
        invalid: true,
        state: 'success',
      },
    })

    const textarea = wrapper.get('textarea')

    expect(textarea.attributes('aria-invalid')).toBe('true')
    expect(textarea.attributes('class')).toContain('border-[var(--ds-danger)]')
    expect(textarea.attributes('class')).toContain('focus-visible:ring-[var(--ds-danger)]')
  })

  it('уважает rows и state для валидного значения', () => {
    const wrapper = mount(GrTextarea, {
      props: {
        modelValue: 'text',
        rows: 6,
        state: 'warning',
      },
    })

    const textarea = wrapper.get('textarea')

    expect(textarea.attributes('rows')).toBe('6')
    expect(textarea.attributes('class')).toContain('border-[var(--ds-warning)]')
    expect(textarea.attributes('class')).toContain('focus-visible:ring-[var(--ds-warning)]')
  })
})