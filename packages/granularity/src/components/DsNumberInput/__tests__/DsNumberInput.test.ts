import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import DsNumberInput from '../DsNumberInput.vue'

describe('DsNumberInput', () => {
  it('санитизирует ввод: оставляет только цифры и один дробный разделитель', async () => {
    const wrapper = mount(DsNumberInput, {
      props: {
        modelValue: '',
        decimalSeparator: ',',
      },
    })

    await wrapper.get('input').setValue('12a3,4.5')

    expect(wrapper.emitted()['update:modelValue']?.[0]?.[0]).toBe('123,45')
  })

  it('при вводе точки или запятой подставляет заданный decimalSeparator', async () => {
    const wrapper = mount(DsNumberInput, {
      props: {
        modelValue: '',
        decimalSeparator: '.',
      },
    })

    await wrapper.get('input').setValue('12,34')

    expect(wrapper.emitted()['update:modelValue']?.[0]?.[0]).toBe('12.34')
  })

  it('по умолчанию использует size=md и поддерживает textAlign', () => {
    const wrapper = mount(DsNumberInput, {
      props: {
        modelValue: '123',
        textAlign: 'center',
      },
    })

    const input = wrapper.get('input')
    expect(input.attributes('class')).toContain('h-10')
    expect(input.attributes('class')).toContain('px-3')
    expect(input.attributes('class')).toContain('text-center')
  })

  it('экспортирует focus() через expose', () => {
    const wrapper = mount(DsNumberInput, {
      props: {
        modelValue: '',
      },
    })

    const input = wrapper.get('input').element as HTMLInputElement
    const focusSpy = vi.spyOn(input, 'focus')

    ;(wrapper.vm as unknown as { focus: () => void }).focus()

    expect(focusSpy).toHaveBeenCalledTimes(1)
  })

  it('скрывает плейсхолдер на focus', () => {
    const wrapper = mount(DsNumberInput, {
      props: {
        modelValue: '',
        placeholder: '0.00',
      },
    })

    expect(wrapper.get('input').attributes('class')).toContain('focus:placeholder:text-transparent')
  })

  it('horizontal controls клиппит hover-состояние внутри общего бордера', () => {
    const wrapper = mount(DsNumberInput, {
      props: {
        modelValue: '1',
        controls: true,
        controlsDirection: 'horizontal',
      },
    })

    expect(wrapper.attributes('class')).toContain('overflow-hidden')
    expect(wrapper.attributes('class')).toContain('rounded-md')
  })

  it('учитывает suffix + controls: добавляет padding-right под оба аддона', () => {
    const wrapper = mount(DsNumberInput, {
      props: {
        modelValue: '1',
        size: 'md',
        controls: true,
      },
      slots: {
        suffix: 'kg',
      },
    })

    const inputEl = wrapper.get('input').element as HTMLInputElement
    expect(inputEl.style.paddingRight).toBe('92px')
    expect(wrapper.get('[data-testid="number-input-controls-vertical"]').attributes('style')).toContain('right: 40px')
  })

  it('horizontal controls размещает кнопки слева/справа от input, а prefix/suffix остаются внешними', () => {
    const wrapper = mount(DsNumberInput, {
      props: {
        modelValue: '1',
        size: 'md',
        controls: true,
        controlsDirection: 'horizontal',
      },
      slots: {
        prefix: '$',
        suffix: 'kg',
      },
    })

    const inputEl = wrapper.get('input').element as HTMLInputElement
    expect(inputEl.style.paddingLeft).toBe('92px')
    expect(inputEl.style.paddingRight).toBe('92px')
    expect(wrapper.get('[data-testid="number-input-controls-horizontal-left"]').attributes('style')).toContain('left: 40px')
    expect(wrapper.get('[data-testid="number-input-controls-horizontal-right"]').attributes('style')).toContain('right: 40px')
    expect(wrapper.get('div[aria-hidden="true"][style*="right: 0px"]').exists()).toBe(true)
  })

  it('controls: stepBy увеличивает значение с учётом decimalSeparator', async () => {
    const wrapper = mount(DsNumberInput, {
      props: {
        modelValue: '1,5',
        decimalSeparator: ',',
        controls: true,
      },
    })

    await wrapper.get('button[aria-label="Increase"]').trigger('click')

    expect(wrapper.emitted()['update:modelValue']?.[0]?.[0]).toBe('2,5')
    expect(wrapper.emitted().change?.[0]?.[0]).toBe('2,5')
  })

  it('controls: по умолчанию использует step=1 и учитывает min/max', async () => {
    const wrapper = mount(DsNumberInput, {
      props: {
        modelValue: '10',
        controls: true,
        min: 10,
        max: 10,
      },
    })

    await wrapper.get('button[aria-label="Decrease"]').trigger('click')

    expect(wrapper.emitted()['update:modelValue']?.[0]?.[0]).toBe('10')
  })

  it('controls: precision округляет значение при инкременте/декременте', async () => {
    const wrapper = mount(DsNumberInput, {
      props: {
        modelValue: '1,234',
        decimalSeparator: ',',
        step: 0.1,
        precision: 2,
        controls: true,
      },
    })

    await wrapper.get('button[aria-label="Increase"]').trigger('click')

    expect(wrapper.emitted()['update:modelValue']?.[0]?.[0]).toBe('1,33')
  })

  it('позволяет ограничить ширину prefix/suffix через min/max props', () => {
    const wrapper = mount(DsNumberInput, {
      props: {
        modelValue: '1',
        size: 'md',
        prefixMinWidth: '10px',
        prefixMaxWidth: '30px',
        suffixMinWidth: '20px',
        suffixMaxWidth: '40px',
      },
      slots: {
        prefix: 'very-long-prefix',
        suffix: 'very-long-suffix',
      },
    })

    const prefix = wrapper.get('[data-testid="number-input-prefix"]').element as HTMLElement
    expect(prefix.style.minWidth).toBe('10px')
    expect(prefix.style.maxWidth).toBe('30px')

    const suffix = wrapper.get('[data-testid="number-input-suffix"]').element as HTMLElement
    expect(suffix.style.minWidth).toBe('20px')
    expect(suffix.style.maxWidth).toBe('40px')
  })

  it('если реальная ширина suffix больше minWidth — увеличивает paddingRight и right-offset controls', async () => {
    const wrapper = mount(DsNumberInput, {
      props: {
        modelValue: '1',
        size: 'md',
        controls: true,
      },
      slots: {
        suffix: 'suffix',
      },
    })

    const suffix = wrapper.get('[data-testid="number-input-suffix"]').element as HTMLElement
    suffix.getBoundingClientRect = () => ({
      width: 70,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    await wrapper.setProps({ modelValue: '2' })
    await nextTick()

    const inputEl = wrapper.get('input').element as HTMLInputElement
    expect(inputEl.style.paddingRight).toBe('122px')
    expect(wrapper.get('[data-testid="number-input-controls-vertical"]').attributes('style')).toContain('right: 70px')
  })
})