import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import GrTree from '../GrTree.vue'

type Item = {
  id: number
  label: string
  children?: Item[]
}

function tree() {
  return [
    {
      id: 1,
      label: 'Parent',
      children: [
        { id: 2, label: 'Child A' },
        { id: 3, label: 'Child B' },
      ],
    },
  ] satisfies Item[]
}

function treeWithNestedFolder() {
  return [
    {
      id: 1,
      label: 'Parent',
      children: [
        {
          id: 2,
          label: 'Folder',
          children: [
            { id: 4, label: 'Grandchild' },
          ],
        },
        { id: 3, label: 'Child B' },
      ],
    },
  ] satisfies Item[]
}

describe('GrTree', () => {
  it('рендерит дерево и пробрасывает slot-props `{ node, data }`', () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
      },
      slots: {
        default: ({ node, data }: any) => `${node.label}#${data.id}`,
      },
    })

    const rows = wrapper.findAll('.ds-tree__row')
    expect(rows).toHaveLength(3)
    expect(wrapper.text()).toContain('Parent#1')
    expect(wrapper.text()).toContain('Child A#2')
    expect(wrapper.text()).toContain('Child B#3')
  })

  it('вкладывает дочерние ноды в DOM-узел родительской ноды', () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
      },
    })

    const items = wrapper.findAll('[role="treeitem"]')
    expect(items).toHaveLength(3)

    const parentItem = items[0]
    const parentRow = parentItem.get('.ds-tree__row')
    const childrenWrap = parentItem.get('.ds-tree__children-wrap')

    expect(parentRow.attributes('style')).toBeUndefined()
    expect(childrenWrap.findAll('.ds-tree__row')).toHaveLength(2)
  })

  it('не показывает полосу ветки по умолчанию', () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
      },
    })

    const childrenWrap = wrapper.get('.ds-tree__children-wrap')
    expect(childrenWrap.classes()).not.toContain('ds-tree__children-wrap--with-branch')
  })

  it('включает полосу ветки и активирует её для выбранной ноды и её прямых детей', async () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
        branchLine: true,
        branchLineActiveColor: 'rgb(239, 68, 68)',
      },
    })

    const childrenWrap = wrapper.get('.ds-tree__children-wrap')
    expect(childrenWrap.classes()).toContain('ds-tree__children-wrap--with-branch')
    expect(childrenWrap.attributes('style')).toContain('--ds-tree-branch-line-color: var(--ds-tree-branch-line-default-color, #e2e8f0)')
    expect(childrenWrap.attributes('style')).not.toContain('--ds-tree-branch-line-left')

    ;(wrapper.vm as any).setCurrentKey(1)
    await nextTick()
    expect(childrenWrap.attributes('style')).toContain('--ds-tree-branch-line-color: rgb(239, 68, 68)')

    ;(wrapper.vm as any).setCurrentKey(2)
    await nextTick()
    expect(childrenWrap.attributes('style')).toContain('--ds-tree-branch-line-color: rgb(239, 68, 68)')

    ;(wrapper.vm as any).setCurrentKey(undefined)
    await nextTick()
    expect(childrenWrap.attributes('style')).toContain('--ds-tree-branch-line-color: var(--ds-tree-branch-line-default-color, #e2e8f0)')
  })

  it('поддерживает вычисление своих цветов полосы для каждой папки и не активирует предков глубже прямого уровня', async () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: treeWithNestedFolder(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1, 2],
        branchLine: true,
        branchLineColor: node => node.key === 1 ? 'rgb(226, 232, 240)' : 'rgb(254, 205, 211)',
        branchLineActiveColor: node => node.key === 1 ? 'rgb(14, 165, 233)' : 'rgb(244, 63, 94)',
      },
    })

    const childrenWraps = wrapper.findAll('.ds-tree__children-wrap')
    expect(childrenWraps).toHaveLength(2)
    expect(childrenWraps[0].attributes('style')).toContain('--ds-tree-branch-line-color: rgb(226, 232, 240)')
    expect(childrenWraps[1].attributes('style')).toContain('--ds-tree-branch-line-color: rgb(254, 205, 211)')

    ;(wrapper.vm as any).setCurrentKey(4)
    await nextTick()

    expect(childrenWraps[0].attributes('style')).toContain('--ds-tree-branch-line-color: rgb(226, 232, 240)')
    expect(childrenWraps[1].attributes('style')).toContain('--ds-tree-branch-line-color: rgb(244, 63, 94)')
  })

  it('переносит active-полосу с родителя на выбранную раскрытую папку', async () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: treeWithNestedFolder(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1, 2],
        branchLine: true,
        branchLineColor: 'rgb(226, 232, 240)',
        branchLineActiveColor: 'rgb(14, 165, 233)',
      },
    })

    const childrenWraps = wrapper.findAll('.ds-tree__children-wrap')
    expect(childrenWraps).toHaveLength(2)

    ;(wrapper.vm as any).setCurrentKey(2)
    await nextTick()

    expect(childrenWraps[0].attributes('style')).toContain('--ds-tree-branch-line-color: rgb(226, 232, 240)')
    expect(childrenWraps[1].attributes('style')).toContain('--ds-tree-branch-line-color: rgb(14, 165, 233)')
  })

  it('оставляет active-полосу на родителе, если выбранная папка ещё не раскрыта', async () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: treeWithNestedFolder(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
        branchLine: true,
        branchLineColor: 'rgb(226, 232, 240)',
        branchLineActiveColor: 'rgb(14, 165, 233)',
      },
    })

    const childrenWraps = wrapper.findAll('.ds-tree__children-wrap')
    expect(childrenWraps).toHaveLength(1)

    ;(wrapper.vm as any).setCurrentKey(2)
    await nextTick()

    expect(childrenWraps[0].attributes('style')).toContain('--ds-tree-branch-line-color: rgb(14, 165, 233)')
  })

  it('поддерживает фильтрацию через `expose.filter()` (показывает match + ancestor)', async () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [],
      },
    })

    // Only root is visible initially.
    expect(wrapper.findAll('.ds-tree__row')).toHaveLength(1)

    ;(wrapper.vm as any).filter('Child B')
    await nextTick()

    // Parent + matched child.
    const rowsAfter = wrapper.findAll('.ds-tree__row')
    expect(rowsAfter).toHaveLength(2)
    expect(wrapper.text()).toContain('Parent')
    expect(wrapper.text()).toContain('Child B')
    expect(wrapper.text()).not.toContain('Child A')
  })

  it('поддерживает exposed-методы мутации дерева', async () => {
    const data = tree()
    const wrapper = mount(GrTree<Item>, {
      props: {
        data,
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
      },
    })

    const vm = wrapper.vm as any

    vm.appendNode({ id: 4, label: 'Child C' }, 1)
    await nextTick()
    expect(data[0].children?.map(item => item.id)).toEqual([2, 3, 4])
    expect(vm.getNode(4)).toMatchObject({ key: 4, label: 'Child C' })

    vm.insertNodeBefore({ id: 5, label: 'Child Before B' }, 3)
    await nextTick()
    expect(data[0].children?.map(item => item.id)).toEqual([2, 5, 3, 4])

    vm.insertNodeAfter({ id: 6, label: 'Child After B' }, 3)
    await nextTick()
    expect(data[0].children?.map(item => item.id)).toEqual([2, 5, 3, 6, 4])

    vm.removeNode(2)
    await nextTick()
    expect(data[0].children?.map(item => item.id)).toEqual([5, 3, 6, 4])
    expect(vm.getNode(2)).toBeUndefined()
    const labels = wrapper.findAll('.ds-tree__label').map(node => node.text())
    expect(labels).toEqual(['Parent', 'Child Before B', 'Child B', 'Child After B', 'Child C'])
  })

  it('поддерживает getCurrentNode/setCurrentNode и сбрасывает выделение при удалении текущей ноды', async () => {
    const data = tree()
    const wrapper = mount(GrTree<Item>, {
      props: {
        data,
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
      },
    })

    const vm = wrapper.vm as any
    vm.setCurrentNode(data[0].children?.[1])
    await nextTick()

    expect(vm.getCurrentKey()).toBe(3)
    expect(vm.getCurrentNode()).toMatchObject({ key: 3, label: 'Child B' })

    vm.removeNode(3)
    await nextTick()

    expect(vm.getCurrentKey()).toBeUndefined()
    expect(vm.getCurrentNode()).toBeUndefined()
  })

  it('не удаляет ноду через removeNode без назначенного node-key', async () => {
    const data = [
      {
        label: 'Parent',
        children: [
          { label: 'Child A' },
          { label: 'Child B' },
        ],
      },
    ]

    const wrapper = mount(GrTree<any>, {
      props: {
        data,
        nodeKey: null as any,
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [0],
      },
    })

    const vm = wrapper.vm as any
    vm.removeNode(data[0].children[0])
    await nextTick()

    expect(data[0].children.map((item: { label: string }) => item.label)).toEqual(['Child A', 'Child B'])
  })

  it('эмитит `nodeClick` с `(data, node)`', async () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [],
      },
    })

    await wrapper.get('.ds-tree__row').trigger('click')
    const e = wrapper.emitted('nodeClick')
    expect(e).toBeTruthy()
    expect(e![0][0]).toMatchObject({ id: 1, label: 'Parent' })
    expect(e![0][1]).toMatchObject({ key: 1, label: 'Parent' })
  })

  it('показывает DnD-хэндл на hover строки, включая активную, и оставляет его перед toggle', async () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
        draggable: true,
        highlightCurrent: true,
      },
    })

    const rows = wrapper.findAll('.ds-tree__row')
    const parentRow = rows[0]
    const childRow = rows[1]
    const parentChildren = Array.from(parentRow.element.children)

    expect(parentChildren[0]?.classList.contains('ds-tree__drag-handle')).toBe(true)
    expect(parentChildren[1]?.classList.contains('ds-tree__toggle')).toBe(true)

    const parentHandle = parentRow.get('.ds-tree__drag-handle')
    expect(parentHandle.classes()).not.toContain('ds-tree__drag-handle--visible')

    await parentRow.trigger('mouseenter')
    expect(parentHandle.classes()).toContain('ds-tree__drag-handle--visible')

    await parentRow.trigger('mouseleave')
    expect(parentHandle.classes()).not.toContain('ds-tree__drag-handle--visible')

    ;(wrapper.vm as any).setCurrentKey(1)
    await nextTick()

    await parentRow.trigger('mouseenter')
    expect(parentHandle.classes()).toContain('ds-tree__drag-handle--visible')

    const childHandle = childRow.get('.ds-tree__drag-handle')
    await childRow.trigger('mouseenter')
    expect(childHandle.classes()).toContain('ds-tree__drag-handle--visible')
  })

  it('эмитит `nodeDrop` при DnD (prev/inner/next)', async () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
        draggable: true,
      },
    })

    const rows = wrapper.findAll('.ds-tree__row')
    const dragRow = rows[1]
    const dropRow = rows[2]

    const dragHandle = dragRow.get('.ds-tree__drag-handle')

    const stubTransfer = {
      effectAllowed: 'move',
      dropEffect: 'move',
      setData() {},
    }

    ;(dropRow.element as any).getBoundingClientRect = () => ({
      top: 0,
      bottom: 30,
      left: 0,
      right: 100,
      width: 100,
      height: 30,
      x: 0,
      y: 0,
      toJSON() {},
    })

    await dragHandle.trigger('dragstart', { dataTransfer: stubTransfer })
    await dropRow.trigger('dragover', { dataTransfer: stubTransfer, clientY: 1 })
    await dropRow.trigger('drop', { dataTransfer: stubTransfer })

    const e = wrapper.emitted('nodeDrop')
    expect(e).toBeTruthy()
    expect(e![0][0]).toMatchObject({ key: 2 })
    expect(e![0][1]).toMatchObject({ key: 3 })
    expect(e![0][2]).toBe('prev')
  })

  it('перемещает ноду в данных и DOM при DnD', async () => {
    const data = tree()
    const wrapper = mount(GrTree<Item>, {
      props: {
        data,
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
        draggable: true,
      },
    })

    const rows = wrapper.findAll('.ds-tree__row')
    const dragRow = rows[2]
    const dropRow = rows[1]

    const dragHandle = dragRow.get('.ds-tree__drag-handle')

    const stubTransfer = {
      effectAllowed: 'move',
      dropEffect: 'move',
      setData() {},
    }

    ;(dropRow.element as any).getBoundingClientRect = () => ({
      top: 0,
      bottom: 30,
      left: 0,
      right: 100,
      width: 100,
      height: 30,
      x: 0,
      y: 0,
      toJSON() {},
    })

    await dragHandle.trigger('dragstart', { dataTransfer: stubTransfer })
    await dropRow.trigger('dragover', { dataTransfer: stubTransfer, clientY: 1 })
    await dropRow.trigger('drop', { dataTransfer: stubTransfer })
    await nextTick()

    expect(data[0].children?.map(item => item.id)).toEqual([3, 2])
    expect(wrapper.findAll('.ds-tree__row').map(row => row.text())).toEqual([
      'Parent',
      'Child B',
      'Child A',
    ])
  })

  it('не позволяет перенести ноду в собственное поддерево', async () => {
    const data = treeWithNestedFolder()
    const wrapper = mount(GrTree<Item>, {
      props: {
        data,
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1, 2],
        draggable: true,
      },
    })

    const rows = wrapper.findAll('.ds-tree__row')
    const dragRow = rows[1]
    const dropRow = rows[2]

    const dragHandle = dragRow.get('.ds-tree__drag-handle')

    const stubTransfer = {
      effectAllowed: 'move',
      dropEffect: 'move',
      setData() {},
    }

    ;(dropRow.element as any).getBoundingClientRect = () => ({
      top: 0,
      bottom: 30,
      left: 0,
      right: 100,
      width: 100,
      height: 30,
      x: 0,
      y: 0,
      toJSON() {},
    })

    await dragHandle.trigger('dragstart', { dataTransfer: stubTransfer })
    await dropRow.trigger('dragover', { dataTransfer: stubTransfer, clientY: 15 })
    await dropRow.trigger('drop', { dataTransfer: stubTransfer })
    await nextTick()

    expect(data[0].children?.map(item => item.id)).toEqual([2, 3])
    expect(data[0].children?.[0].children?.map(item => item.id)).toEqual([4])
    expect(wrapper.emitted('nodeDrop')).toBeFalsy()
  })
})
