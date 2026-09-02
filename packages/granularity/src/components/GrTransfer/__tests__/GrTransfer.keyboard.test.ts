import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { announced, resetGranularityDom } from '../../../testing'
import { keydown } from '../../../testing/keyboard'
import GrTransfer from '../GrTransfer.vue'

afterEach(resetGranularityDom)

interface Row extends Record<string, unknown> { id: string, label: string, disabled?: boolean }

const catalog: Row[] = [
  { id: 'a', label: 'Чтение' },
  { id: 'b', label: 'Запись' },
  { id: 'c', label: 'Удаление' },
  { id: 'd', label: 'Аудит' },
]

function mountTransfer(props: Record<string, unknown> = {}) {
  return mount(GrTransfer, {
    attachTo: document.body,
    props: { items: catalog, modelValue: [], ariaLabel: 'Права', ...props },
  })
}

function list(wrapper: ReturnType<typeof mountTransfer>, side: 'source' | 'target') {
  return wrapper.get(`[data-gr-transfer-list="${side}"]`).element
}

function rows(wrapper: ReturnType<typeof mountTransfer>, side: 'source' | 'target') {
  return wrapper.get(`[data-gr-transfer-list="${side}"]`).findAll('[data-gr-transfer-option]')
}

function selected(wrapper: ReturnType<typeof mountTransfer>, side: 'source' | 'target') {
  return rows(wrapper, side).filter(row => row.attributes('aria-selected') === 'true').map(row => row.text())
}

function focusedIndex(wrapper: ReturnType<typeof mountTransfer>, side: 'source' | 'target') {
  return rows(wrapper, side).findIndex(row => row.attributes('tabindex') === '0')
}

describe('GrTransfer: навигация', () => {
  it('стрелка двигает фокус, но не выбор', async () => {
    const wrapper = mountTransfer()

    keydown(list(wrapper, 'source'), 'ArrowDown')
    await nextTick()

    expect(focusedIndex(wrapper, 'source')).toBe(1)
    expect(selected(wrapper, 'source')).toEqual([])
  })

  it('Home и End ведут к краям', async () => {
    const wrapper = mountTransfer()

    keydown(list(wrapper, 'source'), 'End')
    await nextTick()
    expect(focusedIndex(wrapper, 'source')).toBe(3)

    keydown(list(wrapper, 'source'), 'Home')
    await nextTick()
    expect(focusedIndex(wrapper, 'source')).toBe(0)
  })

  it('кольцо не замкнуто: с последней строки вниз хода нет', async () => {
    const wrapper = mountTransfer()

    keydown(list(wrapper, 'source'), 'End')
    await nextTick()
    keydown(list(wrapper, 'source'), 'ArrowDown')
    await nextTick()

    expect(focusedIndex(wrapper, 'source')).toBe(3)
  })
})

describe('GrTransfer: выделение с клавиатуры', () => {
  it('Space переключает отметку и только её', async () => {
    const wrapper = mountTransfer()

    keydown(list(wrapper, 'source'), ' ')
    await nextTick()
    expect(selected(wrapper, 'source')).toEqual(['Чтение'])

    keydown(list(wrapper, 'source'), ' ')
    await nextTick()
    expect(selected(wrapper, 'source')).toEqual([])
  })

  it('Shift со стрелкой растягивает диапазон', async () => {
    const wrapper = mountTransfer()

    keydown(list(wrapper, 'source'), ' ')
    await nextTick()
    keydown(list(wrapper, 'source'), 'ArrowDown', { shiftKey: true })
    await nextTick()
    keydown(list(wrapper, 'source'), 'ArrowDown', { shiftKey: true })
    await nextTick()

    expect(selected(wrapper, 'source')).toEqual(['Чтение', 'Запись', 'Удаление'])
  })

  it('Shift+Space берёт диапазон от якоря', async () => {
    const wrapper = mountTransfer()

    keydown(list(wrapper, 'source'), ' ')
    await nextTick()
    keydown(list(wrapper, 'source'), 'End')
    await nextTick()
    keydown(list(wrapper, 'source'), ' ', { shiftKey: true })
    await nextTick()

    expect(selected(wrapper, 'source')).toHaveLength(4)
  })

  it('Ctrl+A берёт всё показанное, повтор — снимает', async () => {
    const wrapper = mountTransfer()

    keydown(list(wrapper, 'source'), 'a', { ctrlKey: true })
    await nextTick()
    expect(selected(wrapper, 'source')).toHaveLength(4)

    keydown(list(wrapper, 'source'), 'a', { ctrlKey: true })
    await nextTick()
    expect(selected(wrapper, 'source')).toHaveLength(0)
  })

  it('Ctrl+A не достаёт до скрытого фильтром', async () => {
    const wrapper = mountTransfer()
    const search = wrapper.findAll('input[type="search"]')[0]
    await search.setValue('за')
    await nextTick()

    keydown(list(wrapper, 'source'), 'a', { ctrlKey: true })
    await nextTick()

    // Смотреть только на видимые строки здесь недостаточно: скрытые отметки в
    // DOM не попадают, и тест зеленел бы, даже забрав всю панель. Снимаем фильтр.
    await search.setValue('')
    await nextTick()

    expect(selected(wrapper, 'source')).toEqual(['Запись'])
  })
})

describe('GrTransfer: перенос с клавиатуры', () => {
  it('Enter переносит отмеченное', async () => {
    const wrapper = mountTransfer()

    keydown(list(wrapper, 'source'), ' ')
    await nextTick()
    keydown(list(wrapper, 'source'), 'Enter')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a']])
  })

  it('Enter без отметок переносит строку под фокусом', async () => {
    const wrapper = mountTransfer()

    keydown(list(wrapper, 'source'), 'ArrowDown')
    await nextTick()
    keydown(list(wrapper, 'source'), 'Enter')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['b']])
  })

  it('перенос объявляется живому региону', async () => {
    const wrapper = mountTransfer()

    keydown(list(wrapper, 'source'), ' ')
    await nextTick()
    keydown(list(wrapper, 'source'), 'Enter')
    await nextTick()

    expect(await announced()).toBe('1 moved to Selected')
  })

  it('readonly глушит перенос с клавиатуры', async () => {
    const wrapper = mountTransfer({ readonly: true })

    keydown(list(wrapper, 'source'), ' ')
    await nextTick()
    keydown(list(wrapper, 'source'), 'Enter')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('GrTransfer: перестановка правой панели', () => {
  it('Alt со стрелкой двигает строку', async () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b', 'c'] })

    keydown(list(wrapper, 'target'), 'ArrowDown', { altKey: true })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['b', 'a', 'c']])
  })

  it('Alt+End уводит блок в конец', async () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b', 'c'] })

    keydown(list(wrapper, 'target'), 'End', { altKey: true })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['b', 'c', 'a']])
  })

  it('двигает всё выделение сразу, а не одну строку', async () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b', 'c', 'd'] })
    const targetList = list(wrapper, 'target')

    keydown(targetList, ' ')
    await nextTick()
    keydown(targetList, 'ArrowDown', { shiftKey: true })
    await nextTick()
    keydown(targetList, 'ArrowDown', { altKey: true })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['c', 'a', 'b', 'd']])
  })

  it('под фильтром порядок не меняется и об этом говорят', async () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b', 'c'] })
    await wrapper.findAll('input[type="search"]')[1].setValue('чтение')
    await nextTick()

    keydown(list(wrapper, 'target'), 'ArrowDown', { altKey: true })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(await announced()).toBe('Reordering is off while a search is active')
  })

  it('sortable=false выключает перестановку', async () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b'], sortable: false })

    keydown(list(wrapper, 'target'), 'ArrowDown', { altKey: true })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('в левой панели Alt со стрелкой ничего не двигает', async () => {
    const wrapper = mountTransfer()

    keydown(list(wrapper, 'source'), 'ArrowDown', { altKey: true })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
