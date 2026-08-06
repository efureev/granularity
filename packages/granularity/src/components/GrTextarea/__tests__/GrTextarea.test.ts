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
    expect(textarea.attributes('class')).toContain('border-[var(--gr-danger)]')
    expect(textarea.attributes('class')).toContain('focus-visible:ring-[var(--gr-danger)]')
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
    expect(textarea.attributes('class')).toContain('border-[var(--gr-warning)]')
    expect(textarea.attributes('class')).toContain('focus-visible:ring-[var(--gr-warning)]')
  })
})

describe('GrTextarea — паритет с GrInput', () => {
  it('счётчик символов связан с полем через aria-describedby', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: 'abc', showCount: true, maxlength: 10 } })

    const countId = wrapper.get('[data-gr-textarea-count]').attributes('id')
    expect(wrapper.get('[data-gr-textarea-count]').text()).toBe('3 / 10')
    expect(wrapper.get('textarea').attributes('aria-describedby')).toBe(countId)
    expect(wrapper.get('textarea').attributes('maxlength')).toBe('10')
  })

  it('без showCount поле остаётся корневым элементом', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: '' } })

    expect(wrapper.element.tagName).toBe('TEXTAREA')
    expect(wrapper.find('[data-gr-textarea-count]').exists()).toBe(false)
  })

  it('resize управляется пропом', () => {
    expect(mount(GrTextarea, { props: { modelValue: '' } }).classes()).toContain('resize-y')
    expect(mount(GrTextarea, { props: { modelValue: '', resize: 'none' } }).classes()).toContain('resize-none')
  })

  // Прозрачность разбавляет выверенные на AA токены текста.
  it('disabled гасится токенами, а не прозрачностью', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: '', disabled: true } })

    expect(wrapper.classes()).toContain('bg-[var(--gr-muted)]')
    expect(wrapper.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)
  })

  it('readonly и size доходят до поля', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: 'x', readonly: true, size: 'lg' } })

    expect((wrapper.element as HTMLTextAreaElement).readOnly).toBe(true)
    expect(wrapper.classes()).toContain('text-[16px]')
  })
})
