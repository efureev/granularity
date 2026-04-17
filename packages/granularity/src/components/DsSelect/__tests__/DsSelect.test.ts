import { DOMWrapper, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import DsSelect from '../DsSelect.vue'

function getTeleportedElement<T extends Element = HTMLElement>(selector: string): T {
  const element = document.body.querySelector(selector)
  expect(element).toBeTruthy()
  return element as T
}

function getTeleportedOptions(): HTMLButtonElement[] {
  return [...document.body.querySelectorAll<HTMLButtonElement>('button[role="option"]')]
}

describe('DsSelect', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })
  it('поддерживает size=xs в view="default" (h/padding/font-size)', () => {
    const wrapper = mount(DsSelect, {
      props: {
        modelValue: 'USD',
        size: 'xs',
        ariaLabel: 'Currency',
        options: [{ value: 'USD', label: 'USD' }],
      },
    })

    const select = wrapper.get('select')
    expect(select.attributes('class')).toContain('h-7')
    expect(select.attributes('class')).toContain('px-2.5')
    expect(select.attributes('class')).toContain('text-[12px]')
  })

  it('поддерживает size=xs в view="link" (меняет font-size)', () => {
    const wrapper = mount(DsSelect, {
      props: {
        modelValue: 'USD',
        view: 'link',
        size: 'xs',
        ariaLabel: 'Currency link',
        options: [{ value: 'USD', label: 'USD' }],
      },
    })

    const select = wrapper.get('select')
    expect(select.attributes('class')).toContain('text-[12px]')
  })

  it('эмитит update:modelValue при изменении', async () => {
    const wrapper = mount(DsSelect, {
      props: {
        modelValue: 'USD',
        ariaLabel: 'Currency',
        options: [
          { value: 'USD', label: 'USD' },
          { value: 'EUR', label: 'EUR' },
        ],
      },
    })

    await wrapper.get('select').setValue('EUR')

    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeTruthy()
    expect(events![0]).toEqual(['EUR'])
  })

  it('поддерживает view="link" и link-пропсы tone/underline (как у ссылки)', () => {
    const linkWrapper = mount(DsSelect, {
      props: {
        modelValue: 'USD',
        view: 'link',
        variant: 'muted',
        underline: 'none',
        ariaLabel: 'Currency link',
        options: [
          { value: 'USD', label: 'USD' },
          { value: 'EUR', label: 'EUR' },
        ],
      },
    })

    const linkSelect = linkWrapper.get('select')
    expect(linkSelect.attributes('class')).toContain('inline-block')
    expect(linkSelect.attributes('class')).toContain('w-auto')
    expect(linkSelect.attributes('class')).toContain('cursor-pointer')
    expect(linkSelect.attributes('class')).toContain('text-[var(--muted-fg)]')
    expect(linkSelect.attributes('class')).toContain('no-underline')
    expect(linkSelect.attributes('class')).toContain('border-transparent')
    expect(linkSelect.attributes('class')).toContain('bg-transparent')

    const defaultWrapper = mount(DsSelect, {
      props: {
        modelValue: 'USD',
        ariaLabel: 'Currency default',
        options: [{ value: 'USD', label: 'USD' }],
      },
    })

    const defaultSelect = defaultWrapper.get('select')
    expect(defaultSelect.attributes('class')).toContain('border-[var(--brd)]')
  })

  it('в native-режиме добавляет option для modelValue, которого нет в options, когда allowCustomValue=true', () => {
    const wrapper = mount(DsSelect, {
      props: {
        modelValue: 'CUSTOM',
        allowCustomValue: true,
        ariaLabel: 'Currency',
        options: [{ value: 'USD', label: 'USD' }],
      },
    })

    const optionValues = wrapper.findAll('option').map((o) => o.attributes('value'))
    expect(optionValues).toContain('CUSTOM')
  })

  it('в native-режиме с clearable добавляет пустой option в начало (single)', () => {
    const wrapper = mount(DsSelect, {
      props: {
        modelValue: 'USD',
        clearable: true,
        ariaLabel: 'Currency',
        options: [
          { value: 'USD', label: 'USD' },
          { value: 'EUR', label: 'EUR' },
        ],
      },
    })

    const optionValues = wrapper.findAll('option').map((o) => o.attributes('value'))
    expect(optionValues[0]).toBe('')
  })

  it('в native-режиме с clearable и multiple не добавляет пустой option', () => {
    const wrapper = mount(DsSelect, {
      props: {
        modelValue: ['USD'],
        clearable: true,
        multiple: true,
        ariaLabel: 'Currencies',
        options: [
          { value: 'USD', label: 'USD' },
          { value: 'EUR', label: 'EUR' },
        ],
      },
    })

    const optionValues = wrapper.findAll('option').map((o) => o.attributes('value'))
    expect(optionValues).not.toContain('')
  })

  it('в native-режиме показывает шеврон с отступом справа', () => {
    const wrapper = mount(DsSelect, {
      props: {
        modelValue: 'USD',
        ariaLabel: 'Currency',
        options: [
          { value: 'USD', label: 'USD' },
          { value: 'EUR', label: 'EUR' },
        ],
      },
    })

    const chevron = wrapper.get('[data-testid="ds-select-chevron"]')
    const select = wrapper.get('select')

    expect(chevron.attributes('class')).toContain('right-3')
    expect(select.attributes('class')).toContain('appearance-none')
    expect(select.attributes('class')).toContain('pr-9')
  })

  it('в panel-режиме показывает иконку шеврона у триггера', () => {
    const wrapper = mount(DsSelect, {
      props: {
        modelValue: 'USD',
        optionsView: 'panel',
        ariaLabel: 'Currency panel',
        options: [
          { value: 'USD', label: 'USD' },
          { value: 'EUR', label: 'EUR' },
        ],
      },
    })

    const chevron = wrapper.get('[data-testid="ds-select-chevron"]')

    expect(chevron.attributes('class')).toContain('shrink-0')
    expect(chevron.find('.i-lucide-chevron-down').exists()).toBe(true)
  })

  it('в panel-режиме эмитит update:modelValue при выборе опции кликом', async () => {
    const wrapper = mount(DsSelect, {
      attachTo: document.body,
      props: {
        modelValue: 'USD',
        optionsView: 'panel',
        ariaLabel: 'Currency',
        options: [
          { value: 'USD', label: 'USD' },
          { value: 'EUR', label: 'EUR' },
        ],
      },
    })

    await wrapper.get('[data-testid="ds-select-trigger"]').trigger('click')
    await nextTick()

    const eur = getTeleportedOptions().find((button) => button.textContent?.includes('EUR'))
    expect(eur).toBeTruthy()

    await new DOMWrapper(eur).trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['EUR'])
  })

  it('в panel-режиме с clearable очищает single-значение по крестику', async () => {
    const wrapper = mount(DsSelect, {
      props: {
        modelValue: 'USD',
        optionsView: 'panel',
        clearable: true,
        ariaLabel: 'Currency',
        options: [
          { value: 'USD', label: 'USD' },
          { value: 'EUR', label: 'EUR' },
        ],
      },
    })

    await wrapper.get('[data-testid="ds-select-clear"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
  })

  it('в panel-режиме с clearable очищает multiple-значение по крестику', async () => {
    const wrapper = mount(DsSelect, {
      props: {
        modelValue: ['1', '2'],
        multiple: true,
        optionsView: 'panel',
        clearable: true,
        ariaLabel: 'Tags',
        options: [
          { value: '1', label: 'Food' },
          { value: '2', label: 'Cafe' },
        ],
      },
    })

    await wrapper.get('[data-testid="ds-select-clear"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
  })

  it('в panel-режиме позволяет добавить кастомное значение (Enter)', async () => {
    const wrapper = mount(DsSelect, {
      attachTo: document.body,
      props: {
        modelValue: '',
        optionsView: 'panel',
        allowCustomValue: true,
        ariaLabel: 'Currency',
        options: [
          { value: 'USD', label: 'USD' },
          { value: 'EUR', label: 'EUR' },
        ],
      },
    })

    await wrapper.get('[data-testid="ds-select-trigger"]').trigger('click')
    await nextTick()

    const input = new DOMWrapper(getTeleportedElement<HTMLInputElement>('[data-testid="ds-select-custom-input"]'))
    await input.setValue('My custom')
    await nextTick()

    expect(getTeleportedElement('[data-testid="ds-select-add-option"]').textContent).toContain('My custom')

    await input.trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['My custom'])
  })

  it('в panel-режиме поддерживает multiple: клики по опциям добавляют/удаляют значения', async () => {
    const wrapper = mount(DsSelect, {
      attachTo: document.body,
      props: {
        modelValue: [],
        multiple: true,
        optionsView: 'panel',
        closeOnSelect: false,
        ariaLabel: 'Tags',
        options: [
          { value: '1', label: 'Food' },
          { value: '2', label: 'Cafe' },
        ],
      },
    })

    await wrapper.get('[data-testid="ds-select-trigger"]').trigger('click')
    await nextTick()

    const options = getTeleportedOptions()
    expect(options.map((option) => option.textContent?.trim() ?? '')).toEqual(expect.arrayContaining(['Food', 'Cafe']))

    const food = options.find((option) => option.textContent?.includes('Food'))!
    const cafe = options.find((option) => option.textContent?.includes('Cafe'))!

    await new DOMWrapper(food).trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['1']])

    await wrapper.setProps({ modelValue: ['1'] })

    await new DOMWrapper(cafe).trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['1', '2']])

    await wrapper.setProps({ modelValue: ['1', '2'] })

    await new DOMWrapper(getTeleportedOptions().find((option) => option.textContent?.includes('Food'))).trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['2']])
  })

  it('в native-режиме поддерживает multiple: change эмитит массив значений', async () => {
    const wrapper = mount(DsSelect, {
      props: {
        modelValue: [],
        multiple: true,
        ariaLabel: 'Tags native',
        options: [
          { value: '1', label: 'Food' },
          { value: '2', label: 'Cafe' },
        ],
      },
    })

    await wrapper.get('select').setValue(['1', '2'])

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['1', '2']])
  })

  it('показывает placeholder, когда значение не выбрано', async () => {
    const wrapper = mount(DsSelect, {
      props: {
        modelValue: '',
        optionsView: 'panel',
        placeholder: 'optional',
        ariaLabel: 'Select',
        options: [{ value: '1', label: 'One' }],
      },
    })

    expect(wrapper.get('[data-testid="ds-select-trigger"]').text()).toContain('optional')
  })
})
