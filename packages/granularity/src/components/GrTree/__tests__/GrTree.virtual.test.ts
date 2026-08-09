import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import GrTree from '../GrTree.vue'

/**
 * Виртуализация дерева.
 *
 * jsdom не считает layout: высота контейнера и строк там нулевая, поэтому окно
 * считается от объявленного `maxHeight` и оценки строки — ровно тот путь, по
 * которому идут сервер и первый клиентский рендер. Геометрию после реального
 * замера проверяет спек композабла (`useVirtualList.test.ts`), здесь — контракт
 * дерева: что попадает в DOM, что говорит ARIA и куда уходит фокус.
 */

function flatTree(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    label: `Node ${index + 1}`,
  }))
}

function mountVirtual(count = 1000, maxHeight = 300) {
  return mount(GrTree, {
    props: { data: flatTree(count), nodeKey: 'id', virtual: true, maxHeight },
    attachTo: document.body,
  })
}

function nodes(wrapper: ReturnType<typeof mountVirtual>) {
  return wrapper.findAll('[data-gr-tree-node]')
}

describe('GrTree — виртуализация', () => {
  it('без пропа рисует все строки: включение осознанное', () => {
    const wrapper = mount(GrTree, { props: { data: flatTree(200), nodeKey: 'id' } })

    expect(nodes(wrapper)).toHaveLength(200)
    expect(wrapper.get('[data-gr-tree]').attributes('data-gr-virtual')).toBeUndefined()
    wrapper.unmount()
  })

  it('с `virtual` держит в DOM окно, а не весь список', () => {
    const wrapper = mountVirtual(1000, 300)

    const rendered = nodes(wrapper).length
    expect(rendered).toBeGreaterThan(0)
    expect(rendered).toBeLessThan(50)
    wrapper.unmount()
  })

  it('корень становится скроллером, а срезанное держат отступы крайних строк', () => {
    const wrapper = mountVirtual(1000, 300)
    const root = wrapper.get('[data-gr-tree]')

    // Обёрток-распорок между `role="tree"` и `role="treeitem"` быть не должно:
    // роль `tree` требует treeitem'ы прямыми потомками.
    expect(root.attributes('role')).toBe('tree')
    expect(root.element.firstElementChild?.getAttribute('role')).toBe('treeitem')

    const style = root.attributes('style') ?? ''
    expect(style).toContain('overflow: auto')
    expect(style).toContain('max-height: 300px')

    // Распорка не может жить ни в `padding` контейнера (`max-height` меряет ту же
    // коробку), ни в отступах крайних строк: строки заменяются целиком при
    // прыжке прокрутки, и вместе с ними исчезла бы распорка.
    expect(style).not.toContain('padding')
    expect(style).toContain('--gr-virtual-before')
    expect(style).toContain('--gr-virtual-after')

    const rows = nodes(wrapper)
    expect(rows[rows.length - 1].attributes('style') ?? '').not.toContain('margin')
    wrapper.unmount()
  })

  it('ARIA описывает весь набор, а не окно', () => {
    const wrapper = mountVirtual(1000, 300)
    const first = nodes(wrapper)[0]

    // Иначе диктор сказал бы «1 из 20» на списке в тысячу узлов.
    expect(first.attributes('aria-setsize')).toBe('1000')
    expect(first.attributes('aria-posinset')).toBe('1')
    wrapper.unmount()
  })

  it('`End` доводит фокус до последнего узла, а не теряет его на `body`', async () => {
    const wrapper = mountVirtual(1000, 300)

    await wrapper.get('[data-gr-tree]').trigger('keydown', { key: 'End' })
    await nextTick()
    await nextTick()

    const focused = document.activeElement as HTMLElement | null
    expect(focused?.getAttribute('data-gr-tree-node-key')).toBe('1000')
    expect(focused?.getAttribute('tabindex')).toBe('0')
    wrapper.unmount()
  })

  it('публичный `focus(key)` работает по узлу вне окна', async () => {
    const wrapper = mountVirtual(1000, 300)

    expect(wrapper.find('[data-gr-tree-node-key="800"]').exists()).toBe(false)

    ;(wrapper.vm as unknown as { focus: (key: number) => boolean }).focus(800)
    await nextTick()
    await nextTick()

    expect(document.activeElement?.getAttribute('data-gr-tree-node-key')).toBe('800')
    wrapper.unmount()
  })

  it('прокрутка сдвигает окно и отступы', async () => {
    const wrapper = mountVirtual(1000, 300)
    const root = wrapper.get('[data-gr-tree]').element as HTMLElement

    const before = nodes(wrapper)[0].attributes('data-gr-tree-node-key')

    root.scrollTop = 3000
    root.dispatchEvent(new Event('scroll'))
    await nextTick()

    const after = nodes(wrapper)[0].attributes('data-gr-tree-node-key')
    expect(after).not.toBe(before)
    expect(Number(after)).toBeGreaterThan(90)
    wrapper.unmount()
  })

  it('схлопывание списка не оставляет окно за его пределами', async () => {
    const wrapper = mountVirtual(1000, 300)
    const root = wrapper.get('[data-gr-tree]').element as HTMLElement

    root.scrollTop = 20_000
    root.dispatchEvent(new Event('scroll'))
    await nextTick()

    await wrapper.setProps({ data: flatTree(5) })
    await nextTick()

    expect(nodes(wrapper)).toHaveLength(5)
    wrapper.unmount()
  })
})

describe('GrTree — фокус при уходе строки из виртуального окна', () => {
  it('размонтирование сфокусированной строки возвращает фокус на корень дерева', async () => {
    const data = Array.from({ length: 60 }, (_, i) => ({ id: i + 1, label: `Node ${i + 1}` }))
    const wrapper = mount(GrTree, {
      props: { data, nodeKey: 'id', virtual: true, maxHeight: 90 },
      attachTo: document.body,
    })
    await nextTick()

    const firstRow = wrapper.get('[data-gr-tree-node-key="1"]').element as HTMLElement
    firstRow.focus()
    expect(document.activeElement).toBe(firstRow)

    // Уводим окно далеко вниз: строка №1 размонтируется вместе с фокусом.
    const root = wrapper.get('[data-gr-tree]').element as HTMLElement
    root.scrollTop = 1200
    root.dispatchEvent(new Event('scroll'))
    await nextTick()

    expect(wrapper.find('[data-gr-tree-node-key="1"]').exists()).toBe(false)
    // Фокус не должен упасть на body: клавиатура дерева живёт на корне.
    expect(document.activeElement).toBe(root)

    wrapper.unmount()
  })
})
