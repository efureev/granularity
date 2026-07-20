import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrInput from '../GrInput.vue'

describe('GrInput', () => {
  it('поддерживает size=xs', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: 'Hello',
        size: 'xs',
      },
    })

    const input = wrapper.get('input')
    expect(input.attributes('class')).toContain('h-7')
    expect(input.attributes('class')).toContain('px-2.5')
    expect(input.attributes('class')).toContain('text-[12px]')
  })

  it('поддерживает size=lg', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: 'Hello',
        size: 'lg',
      },
    })

    const input = wrapper.get('input')
    expect(input.attributes('class')).toContain('h-11')
    expect(input.attributes('class')).toContain('px-4')
    expect(input.attributes('class')).toContain('text-[16px]')
  })

  it('по умолчанию использует size=md', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: '',
      },
    })

    const input = wrapper.get('input')
    expect(input.attributes('class')).toContain('h-10')
    expect(input.attributes('class')).toContain('px-3')
  })

  it('поддерживает textAlign', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: '123',
        textAlign: 'right',
      },
    })

    const input = wrapper.get('input')
    expect(input.attributes('class')).toContain('text-right')
  })

  it('экспортирует focus() через expose', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: '',
      },
    })

    const input = wrapper.get('input').element as HTMLInputElement
    const focusSpy = vi.spyOn(input, 'focus')

    ;(wrapper.vm as unknown as { focus: () => void }).focus()

    expect(focusSpy).toHaveBeenCalledTimes(1)
  })

  it('поддерживает prefix slot (зарезервированное место внутри, без изменения внешнего размера)', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: '123',
        size: 'md',
      },
      slots: {
        prefix: '₽',
      },
    })

    expect(wrapper.find('.left-0').exists()).toBe(true)

    const inputEl = wrapper.get('input').element as HTMLInputElement
    expect(inputEl.style.paddingLeft).toBe('calc(12px + 2.5rem)')
  })

  it('поддерживает suffix slot (зарезервированное место внутри, без изменения внешнего размера)', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: '123',
        size: 'md',
      },
      slots: {
        suffix: 'kg',
      },
    })

    expect(wrapper.find('.right-0').exists()).toBe(true)

    const inputEl = wrapper.get('input').element as HTMLInputElement
    expect(inputEl.style.paddingRight).toBe('calc(12px + 2.5rem)')
  })

  it('позволяет ограничить ширину prefix/suffix через min/max props', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: '123',
        size: 'md',
        prefixMinWidth: '1rem',
        prefixMaxWidth: '3rem',
        suffixMinWidth: '2rem',
        suffixMaxWidth: '4rem',
      },
      slots: {
        prefix: 'very-long-prefix',
        suffix: 'very-long-suffix',
      },
    })

    const prefix = wrapper.get('[data-testid="gr-input-prefix"]').element as HTMLElement
    expect(prefix.style.minWidth).toBe('1rem')
    expect(prefix.style.maxWidth).toBe('3rem')

    const suffix = wrapper.get('[data-testid="gr-input-suffix"]').element as HTMLElement
    expect(suffix.style.minWidth).toBe('2rem')
    expect(suffix.style.maxWidth).toBe('4rem')
  })

  it('если реальная ширина prefix больше minWidth — увеличивает paddingLeft под фактический размер', async () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: '123',
        size: 'md',
      },
      slots: {
        prefix: 'prefix',
      },
    })

    const prefix = wrapper.get('[data-testid="gr-input-prefix"]').element as HTMLElement
    prefix.getBoundingClientRect = () => ({
      width: 120,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    await wrapper.setProps({ modelValue: '124' })
    await nextTick()

    const inputEl = wrapper.get('input').element as HTMLInputElement
    expect(inputEl.style.paddingLeft).toBe('132px')
  })
})
describe('GrInput — clearable / password / readonly / count (feature)', () => {
  it('readonly: ставит readonly-атрибут', () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'x', readonly: true } })
    expect((wrapper.get('input').element as HTMLInputElement).readOnly).toBe(true)
  })

  it('clearable: показывает кнопку при значении и эмитит пустую строку', async () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'hello', clearable: true } })
    const clearBtn = wrapper.find('[data-gr-input-clear]')
    expect(clearBtn.exists()).toBe(true)

    await clearBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
  })

  it('clearable: кнопки нет при пустом значении или readonly', () => {
    expect(mount(GrInput, { props: { modelValue: '', clearable: true } }).find('[data-gr-input-clear]').exists()).toBe(false)
    expect(mount(GrInput, { props: { modelValue: 'x', clearable: true, readonly: true } }).find('[data-gr-input-clear]').exists()).toBe(false)
  })

  it('passwordToggle: переключает type password ↔ text', async () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'secret', type: 'password', passwordToggle: true } })
    const input = wrapper.get('input')
    expect(input.attributes('type')).toBe('password')

    await wrapper.get('[data-gr-input-password-toggle]').trigger('click')
    expect(input.attributes('type')).toBe('text')
  })

  it('showCount + maxlength: показывает счётчик и ограничивает длину', () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'abc', showCount: true, maxlength: 10 } })
    expect(wrapper.get('[data-gr-input-count]').text()).toBe('3 / 10')
    expect(wrapper.get('input').attributes('maxlength')).toBe('10')
  })
})
