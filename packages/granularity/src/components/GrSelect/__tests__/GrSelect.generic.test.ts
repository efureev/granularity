import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrSelect from '../GrSelect.vue'

/**
 * Дженерик по значению.
 *
 * До него `GrSelectModelValue = string | string[]`, и числовой `id` — самый
 * частый случай — требовал ручного `String(id)` туда и обратно. Две ловушки,
 * которые это прятало:
 *
 *  - нативный `<select>` носит в DOM только строки, поэтому `onChange` эмитил
 *    `"42"` вместо `42`, и `v-model` молча менял тип значения;
 *  - «пусто» проверялось через falsy, а `0` — валидное значение, которое так
 *    считалось отсутствующим.
 */

type NumOption = { value: number, label: string }

const options: NumOption[] = [
  { value: 0, label: 'Ноль' },
  { value: 1, label: 'Один' },
  { value: 42, label: 'Сорок два' },
]

describe('GrSelect<TValue> — числовые значения', () => {
  it('нативный select возвращает число, а не строку', async () => {
    const wrapper = mount(GrSelect<number>, { props: { modelValue: 1, options } })
    await nextTick()

    const select = wrapper.get('select')
    await select.setValue('42')

    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0]
    expect(emitted, 'ожидается число 42, а не строка "42"').toBe(42)
  })

  it('ноль — валидное значение, а не «пусто»', async () => {
    const wrapper = mount(GrSelect<number>, { props: { modelValue: 0, options } })
    await nextTick()

    // Подпись выбранной опции обязана найтись: `0` не должен считаться пустым.
    expect(wrapper.get('select').element.value).toBe('0')
    expect(wrapper.html()).toContain('Ноль')
  })

  it('панель отдаёт число при выборе опции', async () => {
    const wrapper = mount(GrSelect<number>, {
      props: { modelValue: 1, options, optionsView: 'panel' },
      attachTo: document.body,
    })
    await nextTick()

    await wrapper.get('[data-gr-select-trigger]').trigger('click')
    await nextTick()

    const items = document.querySelectorAll<HTMLElement>('[data-gr-select-option]')
    const target = [...items].find(el => el.textContent?.includes('Сорок два'))
    target?.click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(42)
    wrapper.unmount()
  })

  it('multiple отдаёт массив чисел', async () => {
    const wrapper = mount(GrSelect<number>, {
      props: { modelValue: [1], options, multiple: true },
    })
    await nextTick()

    const select = wrapper.get('select').element as HTMLSelectElement
    for (const opt of select.options) opt.selected = opt.value === '0' || opt.value === '42'
    await wrapper.get('select').trigger('change')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([0, 42])
  })

  it('строковый случай продолжает работать без указания типа', async () => {
    const wrapper = mount(GrSelect, {
      props: { modelValue: 'b', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] },
    })
    await nextTick()

    await wrapper.get('select').setValue('a')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('a')
  })
})

describe('GrSelect — объектные значения', () => {
  type Team = { id: number, title: string }

  const teams: Team[] = [
    { id: 1, title: 'Platform' },
    { id: 2, title: 'Growth' },
  ]

  const options = teams.map(team => ({ value: team, label: team.title }))

  it('выбирает объект и показывает его метку', async () => {
    const wrapper = mount(GrSelect, {
      props: { modelValue: teams[0], options, valueKey: 'id' },
    })

    const select = wrapper.get('select')
    expect((select.element as HTMLSelectElement).value).toBe('1')

    await select.setValue('2')
    // Наружу уходит сам объект, а не строка из DOM.
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([teams[1]])
  })

  it('сравнивает по ключу, а не по ссылке', () => {
    // Модель обычно приходит отдельной копией — с `===` она не нашлась бы.
    const copy = { id: 2, title: 'Growth' }
    const wrapper = mount(GrSelect, {
      props: { modelValue: copy, options, valueKey: 'id' },
    })

    expect((wrapper.get('select').element as HTMLSelectElement).value).toBe('2')
  })

  it('множественный выбор снимает отметку с копии значения', async () => {
    const wrapper = mount(GrSelect, {
      props: {
        modelValue: [{ id: 1, title: 'Platform' }],
        options,
        valueKey: 'id',
        multiple: true,
        optionsView: 'panel',
      },
      attachTo: document.body,
    })

    await wrapper.get('[data-gr-select-trigger]').trigger('click')
    await nextTick()

    const first = document.body.querySelector('[role="option"]') as HTMLElement
    expect(first.getAttribute('aria-selected')).toBe('true')

    first.click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
    wrapper.unmount()
  })

  it('без valueKey предупреждает и не склеивает объекты', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(GrSelect, { props: { modelValue: teams[0], options } })

    expect(warn).toHaveBeenCalled()
    expect(warn.mock.calls[0][0]).toContain('valueKey')
    warn.mockRestore()
  })
})
