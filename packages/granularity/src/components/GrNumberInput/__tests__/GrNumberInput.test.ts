import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrNumberInput from '../GrNumberInput.vue'

describe('GrNumberInput', () => {
  it('санитизирует ввод: оставляет только цифры и один дробный разделитель', async () => {
    const wrapper = mount(GrNumberInput, {
      props: {
        modelValue: '',
        decimalSeparator: ',',
      },
    })

    await wrapper.get('input').setValue('12a3,4.5')

    expect(wrapper.emitted()['update:modelValue']?.[0]?.[0]).toBe('123,45')
  })

  it('при вводе точки или запятой подставляет заданный decimalSeparator', async () => {
    const wrapper = mount(GrNumberInput, {
      props: {
        modelValue: '',
        decimalSeparator: '.',
      },
    })

    await wrapper.get('input').setValue('12,34')

    expect(wrapper.emitted()['update:modelValue']?.[0]?.[0]).toBe('12.34')
  })

  it('по умолчанию использует size=md и поддерживает textAlign', () => {
    const wrapper = mount(GrNumberInput, {
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
    const wrapper = mount(GrNumberInput, {
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
    const wrapper = mount(GrNumberInput, {
      props: {
        modelValue: '',
        placeholder: '0.00',
      },
    })

    expect(wrapper.get('input').attributes('class')).toContain('focus:placeholder:text-transparent')
  })

  it('horizontal controls клиппит hover-состояние внутри общего бордера', () => {
    const wrapper = mount(GrNumberInput, {
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
    const wrapper = mount(GrNumberInput, {
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
    const wrapper = mount(GrNumberInput, {
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
    const wrapper = mount(GrNumberInput, {
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
    const wrapper = mount(GrNumberInput, {
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
    const wrapper = mount(GrNumberInput, {
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
    const wrapper = mount(GrNumberInput, {
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
    const wrapper = mount(GrNumberInput, {
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
describe('GrNumberInput — ввод, клампинг, клавиатура и ARIA (item 22)', () => {
  it('разрешает ввести ведущий минус (отрицательные значения)', async () => {
    const wrapper = mount(GrNumberInput, { props: { modelValue: '' } })
    const input = wrapper.get('input')

    await input.setValue('-5')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted?.at(-1)).toEqual(['-5'])
  })

  it('клампит по min/max на change (ручной ввод, а не только кнопки)', async () => {
    const wrapper = mount(GrNumberInput, { props: { modelValue: '999', max: 10 } })
    const input = wrapper.get('input')

    await input.trigger('change')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['10'])
    expect(wrapper.emitted('change')?.at(-1)).toEqual(['10'])
  })

  it('шагает по ArrowUp/ArrowDown и прыгает к границам по Home/End', async () => {
    const Harness = defineComponent({
      components: { GrNumberInput },
      setup() {
        const value = ref('5')
        return { value }
      },
      template: '<GrNumberInput v-model="value" :step="1" :min="0" :max="100" />',
    })
    const wrapper = mount(Harness)
    const input = wrapper.get('input')

    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(input.element.value).toBe('6')

    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.element.value).toBe('5')

    await input.trigger('keydown', { key: 'End' })
    expect(input.element.value).toBe('100')

    await input.trigger('keydown', { key: 'Home' })
    expect(input.element.value).toBe('0')
  })

  it('экспонирует семантику spinbutton (role + aria-value*)', () => {
    const wrapper = mount(GrNumberInput, { props: { modelValue: '7', min: 0, max: 100 } })
    const input = wrapper.get('input')

    expect(input.attributes('role')).toBe('spinbutton')
    expect(input.attributes('aria-valuenow')).toBe('7')
    expect(input.attributes('aria-valuemin')).toBe('0')
    expect(input.attributes('aria-valuemax')).toBe('100')
  })
})

describe('GrNumberInput — locale grouping (feature)', () => {
  it('groups thousands via Intl when not focused, shows raw on focus', async () => {
    const wrapper = mount(GrNumberInput, { props: { modelValue: '1234567', useGrouping: true, locale: 'en-US' } })
    const input = wrapper.get('input')

    // Не в фокусе — сгруппировано.
    expect(input.element.value).toBe('1,234,567')

    await input.trigger('focus')
    await nextTick()
    // В фокусе — сырое значение для редактирования.
    expect(input.element.value).toBe('1234567')

    await input.trigger('blur')
    await nextTick()
    expect(input.element.value).toBe('1,234,567')
  })

  it('does not group by default (useGrouping=false)', () => {
    const wrapper = mount(GrNumberInput, { props: { modelValue: '1234567' } })
    expect(wrapper.get('input').element.value).toBe('1234567')
  })

  it('уважает локале-разделители: de-DE (группа ".", десятичный ",")', () => {
    const wrapper = mount(GrNumberInput, {
      props: { modelValue: '1234567,89', useGrouping: true, locale: 'de-DE', decimalSeparator: ',', precision: 2 },
    })

    // Группа '.', десятичный ',' — оба на своих местах (без затирания первого '.').
    expect(wrapper.get('input').element.value).toBe('1.234.567,89')
  })
})
