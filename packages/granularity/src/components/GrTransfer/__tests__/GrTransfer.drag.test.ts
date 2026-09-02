import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { announced, resetGranularityDom } from '../../../testing'
import { mockRect, stackRects } from '../../../testing/geometry'
import { cancelPointer, move, pointer, press, release } from '../../../testing/pointer'
import GrTransfer from '../GrTransfer.vue'

afterEach(resetGranularityDom)

interface Row extends Record<string, unknown> { id: string, label: string }

const catalog: Row[] = [
  { id: 'a', label: 'Чтение' },
  { id: 'b', label: 'Запись' },
  { id: 'c', label: 'Удаление' },
  { id: 'd', label: 'Аудит' },
]

/** Панели не пересекаются по горизонтали: сторона выбирается их прямоугольниками. */
const SOURCE_BOX = { left: 0, top: 0, width: 100, height: 200 }
const TARGET_BOX = { left: 200, top: 0, width: 100, height: 200 }

function mountTransfer(props: Record<string, unknown> = {}) {
  const wrapper = mount(GrTransfer, {
    attachTo: document.body,
    props: { items: catalog, modelValue: [], ariaLabel: 'Права', ...props },
  })

  mockRect(wrapper.get('[data-gr-transfer-panel="source"]').element, SOURCE_BOX)
  mockRect(wrapper.get('[data-gr-transfer-panel="target"]').element, TARGET_BOX)

  for (const side of ['source', 'target'] as const) {
    const rows = wrapper.get(`[data-gr-transfer-list="${side}"]`)
      .findAll('[data-gr-transfer-option]')
      .map(row => row.element)
    stackRects(rows, { size: 20 })
  }

  return wrapper
}

function rowsOf(wrapper: ReturnType<typeof mountTransfer>, side: 'source' | 'target') {
  return wrapper.get(`[data-gr-transfer-list="${side}"]`).findAll('[data-gr-transfer-option]')
}

describe('GrTransfer: перетаскивание между панелями', () => {
  it('строка уезжает в соседнюю панель', async () => {
    const wrapper = mountTransfer()

    press(rowsOf(wrapper, 'source')[1].element, { clientX: 50, clientY: 30 })
    move({ clientX: 250, clientY: 100 })
    release({ clientX: 250, clientY: 100 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['b']])
    expect(wrapper.emitted('transfer')?.at(-1)).toEqual([['b'], 'toTarget'])
  })

  it('встаёт на то место, куда положили', async () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b'] })

    // Верхняя половина первой строки правой панели — «перед a».
    press(rowsOf(wrapper, 'source')[0].element, { clientX: 50, clientY: 10 })
    move({ clientX: 250, clientY: 5 })
    release({ clientX: 250, clientY: 5 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['c', 'a', 'b']])
  })

  it('перестановка внутри правой панели', async () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b', 'c'] })

    // Ниже последней строки — в конец.
    press(rowsOf(wrapper, 'target')[0].element, { clientX: 250, clientY: 10 })
    move({ clientX: 250, clientY: 190 })
    release({ clientX: 250, clientY: 190 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['b', 'c', 'a']])
  })

  it('возврат налево убирает ключ из модели', async () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b'] })

    press(rowsOf(wrapper, 'target')[0].element, { clientX: 250, clientY: 10 })
    move({ clientX: 50, clientY: 100 })
    release({ clientX: 50, clientY: 100 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['b']])
  })

  it('в пустую панель тоже роняется', async () => {
    const wrapper = mountTransfer({ modelValue: [] })

    press(rowsOf(wrapper, 'source')[0].element, { clientX: 50, clientY: 10 })
    move({ clientX: 250, clientY: 150 })
    release({ clientX: 250, clientY: 150 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a']])
  })
})

describe('GrTransfer: границы жеста', () => {
  it('нажатие без движения жестом не становится', async () => {
    const wrapper = mountTransfer()

    press(rowsOf(wrapper, 'source')[0].element, { clientX: 50, clientY: 10 })
    move({ clientX: 51, clientY: 11 })
    release({ clientX: 51, clientY: 11 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('обрыв возвращает строку и объявляет отмену', async () => {
    const wrapper = mountTransfer()

    press(rowsOf(wrapper, 'source')[0].element, { clientX: 50, clientY: 10 })
    move({ clientX: 250, clientY: 100 })
    cancelPointer({ clientX: 250, clientY: 100 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(await announced()).toBe('Move cancelled')
  })

  it('Esc посреди жеста отменяет перенос', async () => {
    const wrapper = mountTransfer()

    press(rowsOf(wrapper, 'source')[0].element, { clientX: 50, clientY: 10 })
    move({ clientX: 250, clientY: 100 })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    release({ clientX: 250, clientY: 100 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('draggable=false жест не начинает', async () => {
    const wrapper = mountTransfer({ draggable: false })

    press(rowsOf(wrapper, 'source')[0].element, { clientX: 50, clientY: 10 })
    move({ clientX: 250, clientY: 100 })
    release({ clientX: 250, clientY: 100 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('палец панель прокручивает, а не тащит строку', async () => {
    const wrapper = mountTransfer()
    const event = pointer('pointerdown', { clientX: 50, clientY: 10 })
    Object.defineProperty(event, 'pointerType', { value: 'touch' })
    rowsOf(wrapper, 'source')[0].element.dispatchEvent(event)

    move({ clientX: 250, clientY: 100 })
    release({ clientX: 250, clientY: 100 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('readonly жест не начинает', async () => {
    const wrapper = mountTransfer({ readonly: true })

    press(rowsOf(wrapper, 'source')[0].element, { clientX: 50, clientY: 10 })
    move({ clientX: 250, clientY: 100 })
    release({ clientX: 250, clientY: 100 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('GrTransfer: жест и выделение', () => {
  it('тащит весь отмеченный блок, а не одну строку', async () => {
    const wrapper = mountTransfer()

    await rowsOf(wrapper, 'source')[0].trigger('click')
    await rowsOf(wrapper, 'source')[2].trigger('click', { ctrlKey: true })

    press(rowsOf(wrapper, 'source')[0].element, { clientX: 50, clientY: 10 })
    move({ clientX: 250, clientY: 100 })
    release({ clientX: 250, clientY: 100 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a', 'c']])
  })

  it('за неотмеченную строку едет только она', async () => {
    const wrapper = mountTransfer()

    await rowsOf(wrapper, 'source')[0].trigger('click')

    press(rowsOf(wrapper, 'source')[2].element, { clientX: 50, clientY: 50 })
    move({ clientX: 250, clientY: 100 })
    release({ clientX: 250, clientY: 100 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['c']])
  })

  it('клик после жеста не схлопывает выделение в одну строку', async () => {
    const wrapper = mountTransfer()

    await rowsOf(wrapper, 'source')[0].trigger('click')
    await rowsOf(wrapper, 'source')[1].trigger('click', { ctrlKey: true })

    // Протяжка, оборванная за пределами обеих панелей: модель не меняется,
    // но `click` по отпусканию пришёл бы и сбросил выбор.
    press(rowsOf(wrapper, 'source')[0].element, { clientX: 50, clientY: 10 })
    move({ clientX: 400, clientY: 400 })
    release({ clientX: 400, clientY: 400 })
    await rowsOf(wrapper, 'source')[0].trigger('click')
    await nextTick()

    const selected = rowsOf(wrapper, 'source')
      .filter(row => row.attributes('aria-selected') === 'true')
    expect(selected).toHaveLength(2)
  })
})
