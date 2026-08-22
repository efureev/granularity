import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import GrTree from '../GrTree.vue'

/**
 * Управляемое состояние дерева.
 *
 * До этого текущий узел и фильтр задавались только методами инстанса, и обёртке
 * приходилось держать `ref` на дерево, гоняя состояние в него через `nextTick` —
 * порядок, который нигде не выражен типами. Хуже: у одного понятия оказывалось
 * два владельца, и разойдись они на такт, строка подсвечена, а всё, что обёртка
 * рисует по своему пропу, — нет.
 */
type Item = { id: number, label: string, children?: Item[] }

const data: Item[] = [
  { id: 1, label: 'Родитель', children: [{ id: 2, label: 'Ребёнок A' }, { id: 3, label: 'Ребёнок B' }] },
  { id: 4, label: 'Сосед' },
]

function mountTree(props: Record<string, unknown> = {}) {
  return mount(GrTree, {
    props: { data, nodeKey: 'id', defaultExpandAll: true, ...props },
    attachTo: document.body,
  })
}

/** Обработчики клика и наведения висят на строке, а не на узле-обёртке. */
function rows(wrapper: ReturnType<typeof mountTree>) {
  return wrapper.findAll('[data-gr-tree-row]')
}

function currentRow(wrapper: ReturnType<typeof mountTree>) {
  return wrapper.find('.gr-tree__row--current')
}

describe('GrTree — текущий узел пропом', () => {
  it('подсвечивает строку по `currentKey` без единого вызова метода', async () => {
    const wrapper = mountTree({ currentKey: 3 })
    await nextTick()

    expect(currentRow(wrapper).text()).toContain('Ребёнок B')

    await wrapper.setProps({ currentKey: 4 })
    await nextTick()

    expect(currentRow(wrapper).text()).toContain('Сосед')
    wrapper.unmount()
  })

  it('клик сообщает выбор наружу', async () => {
    const wrapper = mountTree({ currentKey: 1 })
    await nextTick()

    await rows(wrapper)[2].trigger('click')

    expect(wrapper.emitted('update:currentKey')?.at(-1)).toEqual([3])
    wrapper.unmount()
  })

  it('`null` снимает выбор', async () => {
    const wrapper = mountTree({ currentKey: 3 })
    await nextTick()
    expect(currentRow(wrapper).exists()).toBe(true)

    await wrapper.setProps({ currentKey: null })
    await nextTick()

    expect(currentRow(wrapper).exists()).toBe(false)
    wrapper.unmount()
  })

  // Проп не задан — дерево ведёт текущий узел само, как и до появления `v-model`.
  it('без пропа поведение прежнее', async () => {
    const wrapper = mountTree()
    await nextTick()

    await rows(wrapper)[1].trigger('click')
    await nextTick()

    expect(currentRow(wrapper).text()).toContain('Ребёнок A')
    wrapper.unmount()
  })
})

describe('GrTree — фильтр пропом', () => {
  const filterNodeMethod = (value: string, item: Item) => (
    value === '' || item.label.toLowerCase().includes(value.toLowerCase())
  )

  it('прячет несовпавшие узлы', async () => {
    const wrapper = mountTree({ filterNodeMethod, filterValue: 'сосед' })
    await nextTick()
    await nextTick()

    expect(rows(wrapper).map(row => row.text())).toEqual(['Сосед'])
    wrapper.unmount()
  })

  /**
   * Без числа наружу потребитель не отличит «данных нет» от «поиск ничего не
   * нашёл» — а это разные экраны: второй пользователь может исправить сам.
   */
  it('сообщает результат: сколько видно и сколько совпало', async () => {
    const wrapper = mountTree({ filterNodeMethod, filterValue: '' })
    await nextTick()

    await wrapper.setProps({ filterValue: 'ребёнок' })
    await nextTick()
    await nextTick()

    // Видно три строки — два совпадения и раскрытый ради них родитель.
    expect(wrapper.emitted('filter')?.at(-1)?.[0]).toEqual({
      value: 'ребёнок',
      visibleCount: 3,
      matchedCount: 2,
    })

    await wrapper.setProps({ filterValue: 'ничего такого' })
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('filter')?.at(-1)?.[0]).toEqual({
      value: 'ничего такого',
      visibleCount: 0,
      matchedCount: 0,
    })
    wrapper.unmount()
  })

  it('императивный `filter()` сообщает результат тем же событием', async () => {
    const wrapper = mountTree({ filterNodeMethod })
    await nextTick()

    ;(wrapper.vm as unknown as { filter: (value: string) => void }).filter('сосед')
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('filter')?.at(-1)?.[0]).toMatchObject({ visibleCount: 1, matchedCount: 1 })
    wrapper.unmount()
  })
})

describe('GrTree — видимость ручки переноса', () => {
  function handles(wrapper: ReturnType<typeof mountTree>) {
    return wrapper.findAll('[data-gr-tree-drag-handle]')
  }

  it('`always` показывает ручку без наведения', async () => {
    const wrapper = mountTree({ draggable: true, dragHandleVisibility: 'always' })
    await nextTick()

    expect(handles(wrapper).every(handle => handle.classes('gr-tree__drag-handle--visible'))).toBe(true)
    wrapper.unmount()
  })

  it('`hover` оставляет ручку скрытой, пока курсор не пришёл', async () => {
    const wrapper = mountTree({ draggable: true, dragHandleVisibility: 'hover' })
    await nextTick()

    expect(handles(wrapper).some(handle => handle.classes('gr-tree__drag-handle--visible'))).toBe(false)

    await rows(wrapper)[0].trigger('mouseenter')

    expect(handles(wrapper)[0].classes('gr-tree__drag-handle--visible')).toBe(true)
    wrapper.unmount()
  })

  /**
   * `auto` решается медиазапросом, а не `matchMedia`: ответ нужен и на сервере.
   * В jsdom проверяем то, на чём правило держится, — класс-модификатор.
   */
  it('`auto` по умолчанию и помечает корень для медиазапроса', async () => {
    const wrapper = mountTree({ draggable: true })
    await nextTick()

    expect(wrapper.get('[data-gr-tree]').classes()).toContain('gr-tree--drag-handle-auto')

    await wrapper.setProps({ dragHandleVisibility: 'hover' })
    expect(wrapper.get('[data-gr-tree]').classes()).not.toContain('gr-tree--drag-handle-auto')
    wrapper.unmount()
  })
})
