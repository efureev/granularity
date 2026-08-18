import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import GrAutocomplete from '../GrAutocomplete.vue'

/**
 * Клавиатура сверх стрелок по списку: навигация по чипам и коммит
 * произвольного значения при непустом списке.
 */

const OPTIONS = [
  { value: 'design', label: 'Design' },
  { value: 'platform', label: 'Platform' },
]

afterEach(() => {
  document.body.innerHTML = ''
})

function chipRemoveButtons(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>('[data-gr-chip-close]')]
}

function mountMultiple(modelValue: string[]) {
  return mount(GrAutocomplete, {
    props: { modelValue, multiple: true, options: OPTIONS, ariaLabel: 'Teams' },
    attachTo: document.body,
  })
}

describe('GrAutocomplete — чипы с клавиатуры', () => {
  it('ArrowLeft из пустого запроса уводит на последний чип и закрывает панель', async () => {
    const wrapper = mountMultiple(['design', 'platform'])
    const input = wrapper.get('input')
    input.element.focus()
    await input.trigger('focus')
    expect(input.attributes('aria-expanded')).toBe('true')

    await input.trigger('keydown', { key: 'ArrowLeft' })

    expect(document.activeElement).toBe(chipRemoveButtons()[1])
    expect(input.attributes('aria-expanded')).toBe('false')

    wrapper.unmount()
  })

  it('стрелки ходят между чипами, ArrowRight с последнего возвращает в поле', async () => {
    const wrapper = mountMultiple(['design', 'platform'])
    const input = wrapper.get('input')
    input.element.focus()
    await input.trigger('keydown', { key: 'ArrowLeft' })

    const chips = chipRemoveButtons()
    await wrapper.findAll('[data-gr-chip-close]')[1].trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(chips[0])

    await wrapper.findAll('[data-gr-chip-close]')[0].trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(chips[1])

    await wrapper.findAll('[data-gr-chip-close]')[1].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(input.element)

    wrapper.unmount()
  })

  it('Delete удаляет чип под фокусом и оставляет фокус на соседнем', async () => {
    // Через `v-model`, а не `setProps`: фокус переставляется на следующем тике
    // после обновления списка чипов, и порядок здесь — часть проверки.
    const Harness = defineComponent({
      components: { GrAutocomplete },
      setup: () => ({ teams: ref(['design', 'platform']), options: OPTIONS }),
      template: `<GrAutocomplete v-model="teams" multiple :options="options" aria-label="Teams" />`,
    })

    const wrapper = mount(Harness, { attachTo: document.body })
    const input = wrapper.get('input')
    input.element.focus()
    await input.trigger('keydown', { key: 'ArrowLeft' })

    await wrapper.findAll('[data-gr-chip-close]')[1].trigger('keydown', { key: 'Delete' })
    await nextTick()

    expect(chipRemoveButtons()).toHaveLength(1)
    expect(document.activeElement).toBe(chipRemoveButtons()[0])

    wrapper.unmount()
  })

  it('Escape с чипа возвращает фокус в поле', async () => {
    const wrapper = mountMultiple(['design'])
    const input = wrapper.get('input')
    input.element.focus()
    await input.trigger('keydown', { key: 'ArrowLeft' })

    await wrapper.get('[data-gr-chip-close]').trigger('keydown', { key: 'Escape' })
    expect(document.activeElement).toBe(input.element)

    wrapper.unmount()
  })

  it('ArrowLeft при непустом запросе оставляет каретку в поле', async () => {
    const wrapper = mountMultiple(['design'])
    const input = wrapper.get('input')
    input.element.focus()
    await input.setValue('pl')

    await input.trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(input.element)

    wrapper.unmount()
  })
})

describe('GrAutocomplete — «Add …» в навигации', () => {
  it('Enter коммитит произвольное значение и при непустом списке', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, allowCustomValue: true, ariaLabel: 'Team' },
      attachTo: document.body,
    })
    const input = wrapper.get('input')
    await input.trigger('focus')
    // Запрос — подстрока существующей опции, поэтому список остаётся непустым.
    await input.setValue('de')
    await nextTick()

    expect(document.querySelector('[data-gr-autocomplete-add-option]')).toBeTruthy()
    expect(document.querySelectorAll('[data-gr-autocomplete-option]').length).toBeGreaterThan(0)

    // Первый элемент навигации — «Add …», активен сразу после открытия списка.
    await input.trigger('keydown', { key: 'Home' })
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['de'])

    wrapper.unmount()
  })

  it('«Add …» — валидная опция списка и указывается aria-activedescendant', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, allowCustomValue: true, ariaLabel: 'Team' },
      attachTo: document.body,
    })
    const input = wrapper.get('input')
    await input.trigger('focus')
    await input.setValue('de')
    await nextTick()
    await input.trigger('keydown', { key: 'Home' })

    const add = document.querySelector('[data-gr-autocomplete-add-option]')!
    expect(add.getAttribute('role')).toBe('option')
    expect(add.getAttribute('tabindex')).toBe('-1')
    expect(input.attributes('aria-activedescendant')).toBe(add.id)

    wrapper.unmount()
  })
})
