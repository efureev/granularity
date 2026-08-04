import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import GrAutocomplete from '../GrAutocomplete.vue'

/**
 * Дженерик по значению — то же, что у `GrSelect`. У автокомплита нет нативного
 * `<select>`, поэтому строкового барьера DOM здесь не было; ловушка была одна,
 * зато тихая: «пусто» проверялось через falsy, а `0` — валидное значение.
 */

// Панель телепортируется в `body` и при `attachTo` остаётся там после теста:
// без уборки следующий тест находит опции предыдущего и кликает мимо компонента.
afterEach(() => {
  document.body.innerHTML = ''
})

const options = [
  { value: 0, label: 'Ноль' },
  { value: 7, label: 'Семь' },
]

describe('GrAutocomplete<TValue> — числовые значения', () => {
  it('ноль считается выбранным, а не пустым', async () => {
    const wrapper = mount(GrAutocomplete<number>, { props: { modelValue: 0, options } })
    await nextTick()

    // Подпись выбранного значения обязана попасть в инпут.
    expect(wrapper.get('input').element.value).toBe('Ноль')
  })

  it('выбор опции отдаёт число', async () => {
    const wrapper = mount(GrAutocomplete<number>, {
      props: { modelValue: 0, options },
      attachTo: document.body,
    })
    await nextTick()

    await wrapper.get('input').trigger('focus')
    // После выбора запрос равен подписи, и фильтр прячет остальные опции —
    // очищаем ввод, чтобы список был полным.
    await wrapper.get('input').setValue('')
    await nextTick()

    const items = document.querySelectorAll<HTMLElement>('[data-gr-autocomplete-option]')
    expect(items, 'обе опции должны быть в панели').toHaveLength(2)
    items[1].click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(7)
    wrapper.unmount()
  })

  it('multiple отдаёт массив чисел, включая ноль', async () => {
    const wrapper = mount(GrAutocomplete<number>, {
      props: { modelValue: [7], options, multiple: true },
      attachTo: document.body,
    })
    await nextTick()

    await wrapper.get('input').trigger('focus')
    await wrapper.get('input').setValue('')
    await nextTick()

    const items = document.querySelectorAll<HTMLElement>('[data-gr-autocomplete-option]')
    expect(items, 'обе опции должны быть в панели').toHaveLength(2)
    items[0].click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([7, 0])
    wrapper.unmount()
  })

  it('строковый случай продолжает работать без указания типа', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: 'a', options: [{ value: 'a', label: 'A' }] },
    })
    await nextTick()

    expect(wrapper.get('input').element.value).toBe('A')
  })
})
