import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import GrTree from '../GrTree.vue'
import type { GrTreeNode } from '../grTreeTypes'

type Item = { id: number, label: string, children?: Item[], isLeaf?: boolean }

function roots(): Item[] {
  return [
    { id: 1, label: 'Branch' },
    { id: 2, label: 'File', isLeaf: true },
  ]
}

function mountLazy(load: (node: GrTreeNode<Item>, resolve: (children: Item[]) => void) => void, props = {}) {
  return mount(GrTree<Item>, {
    props: {
      data: roots(),
      nodeKey: 'id',
      props: { children: 'children', label: 'label' },
      lazy: true,
      load,
      ...props,
    },
    attachTo: document.body,
  })
}

describe('GrTree — ленивая подгрузка', () => {
  it('узел без детей разворачивается, пока не сказано, что он лист', () => {
    const wrapper = mountLazy(() => {})
    const items = wrapper.findAll('[role="treeitem"]')

    expect(items[0].attributes('aria-expanded')).toBe('false')
    // `isLeaf: true` в данных — раскрывать нечего, кнопки нет.
    expect(items[1].attributes('aria-expanded')).toBeUndefined()
    expect(wrapper.findAll('[data-gr-tree-toggle]')).toHaveLength(1)

    wrapper.unmount()
  })

  it('раскрытие грузит ветку один раз и показывает загрузку', async () => {
    let resolveChildren: ((children: Item[]) => void) | undefined
    const load = vi.fn((_node, resolve) => { resolveChildren = resolve })

    const wrapper = mountLazy(load)
    await wrapper.get('[data-gr-tree-toggle]').trigger('click')

    expect(load).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[role="treeitem"]').attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[data-gr-tree-loading]').exists()).toBe(true)

    resolveChildren?.([{ id: 11, label: 'Loaded', isLeaf: true }])
    await nextTick()

    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3)
    expect(wrapper.get('[role="treeitem"]').attributes('aria-busy')).toBeUndefined()
    expect(wrapper.find('[data-gr-tree-loading]').exists()).toBe(false)

    // Свернули и раскрыли снова — второго запроса нет.
    await wrapper.get('[data-gr-tree-toggle]').trigger('click')
    await wrapper.get('[data-gr-tree-toggle]').trigger('click')
    expect(load).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('пустой ответ делает ветку листом', async () => {
    const wrapper = mountLazy((_node, resolve) => resolve([]))

    await wrapper.get('[data-gr-tree-toggle]').trigger('click')
    await nextTick()

    const first = wrapper.get('[role="treeitem"]')
    expect(first.attributes('aria-expanded')).toBeUndefined()
    expect(wrapper.findAll('[data-gr-tree-toggle]')).toHaveLength(0)

    wrapper.unmount()
  })

  it('повторный `resolve` не задваивает детей', async () => {
    let resolveChildren: ((children: Item[]) => void) | undefined
    const wrapper = mountLazy((_node, resolve) => { resolveChildren = resolve })

    await wrapper.get('[data-gr-tree-toggle]').trigger('click')
    resolveChildren?.([{ id: 11, label: 'Loaded', isLeaf: true }])
    resolveChildren?.([{ id: 12, label: 'Twice', isLeaf: true }])
    await nextTick()

    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3)

    wrapper.unmount()
  })

  it('загрузчик получает узел, чьи данные и дописывает', async () => {
    const seen: GrTreeNode<Item>[] = []
    const wrapper = mountLazy((node, resolve) => {
      seen.push(node)
      resolve([{ id: 11, label: `${node.label} / child`, isLeaf: true }])
    })

    await wrapper.get('[data-gr-tree-toggle]').trigger('click')
    await nextTick()

    expect(seen[0].key).toBe(1)
    expect(wrapper.findAll('[role="treeitem"]')[1].text()).toContain('Branch / child')

    wrapper.unmount()
  })

  it('без `lazy` узел без детей остаётся листом', () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: roots(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
      },
    })

    expect(wrapper.findAll('[data-gr-tree-toggle]')).toHaveLength(0)

    wrapper.unmount()
  })

  it('`defaultExpandAll` не дёргает загрузчик у незагруженных веток', () => {
    const load = vi.fn()
    const wrapper = mountLazy(load, { defaultExpandAll: true })

    expect(load).not.toHaveBeenCalled()

    wrapper.unmount()
  })
})
