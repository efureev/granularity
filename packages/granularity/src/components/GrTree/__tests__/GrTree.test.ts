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

    const rows = wrapper.findAll('.gr-tree__row')
    expect(rows).toHaveLength(3)
    expect(wrapper.text()).toContain('Parent#1')
    expect(wrapper.text()).toContain('Child A#2')
    expect(wrapper.text()).toContain('Child B#3')
  })

  it('рендерит плоский список строк и сообщает иерархию через aria', () => {
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

    // Вложенного DOM больше нет: строки лежат в одном списке, а уровень,
    // позицию и размер набора несут ARIA-атрибуты.
    expect(wrapper.findAll('[role="group"]')).toHaveLength(0)
    expect(items.map(i => i.attributes('aria-level'))).toEqual(['1', '2', '2'])
    expect(items.map(i => i.attributes('aria-posinset'))).toEqual(['1', '1', '2'])
    expect(items.map(i => i.attributes('aria-setsize'))).toEqual(['1', '2', '2'])
  })

  it('отступ уровня задаётся строкой, шаг настраивается пропом `indent`', () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
        indent: 20,
      },
    })

    const rows = wrapper.findAll('[data-gr-tree-row]')
    expect(rows[0].attributes('style')).toContain('--gr-tree-row-indent: calc(20px * 0)')
    expect(rows[1].attributes('style')).toContain('--gr-tree-row-indent: calc(20px * 1)')
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

    expect(wrapper.findAll('[data-gr-tree-branch-guide]')).toHaveLength(0)
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

    // Направляющая рисуется у каждого потомка — по одной на уровень предка.
    const guides = () => wrapper.findAll('[data-gr-tree-branch-guide]')
    expect(guides()).toHaveLength(2)
    expect(guides()[0].attributes('style')).toContain('--gr-tree-branch-line-color: var(--gr-tree-branch-line-default-color, var(--gr-brd))')

    ;(wrapper.vm as any).setCurrentKey(1)
    await nextTick()
    expect(guides()[0].attributes('style')).toContain('--gr-tree-branch-line-color: rgb(239, 68, 68)')

    ;(wrapper.vm as any).setCurrentKey(2)
    await nextTick()
    expect(guides()[0].attributes('style')).toContain('--gr-tree-branch-line-color: rgb(239, 68, 68)')

    ;(wrapper.vm as any).setCurrentKey(undefined)
    await nextTick()
    expect(guides()[0].attributes('style')).toContain('--gr-tree-branch-line-color: var(--gr-tree-branch-line-default-color, var(--gr-brd))')
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

    // У внука две направляющие: своя на каждого предка, цвет считается по нему.
    const grandchild = wrapper.findAll('[data-gr-tree-node]')[2]
    const guides = () => grandchild.findAll('[data-gr-tree-branch-guide]')
    expect(guides()).toHaveLength(2)
    expect(guides()[0].attributes('style')).toContain('--gr-tree-branch-line-color: rgb(226, 232, 240)')
    expect(guides()[1].attributes('style')).toContain('--gr-tree-branch-line-color: rgb(254, 205, 211)')

    ;(wrapper.vm as any).setCurrentKey(4)
    await nextTick()

    expect(guides()[0].attributes('style')).toContain('--gr-tree-branch-line-color: rgb(226, 232, 240)')
    expect(guides()[1].attributes('style')).toContain('--gr-tree-branch-line-color: rgb(244, 63, 94)')
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

    ;(wrapper.vm as any).setCurrentKey(2)
    await nextTick()

    const grandchild = wrapper.findAll('[data-gr-tree-node]')[2]
    const guides = grandchild.findAll('[data-gr-tree-branch-guide]')
    expect(guides[0].attributes('style')).toContain('--gr-tree-branch-line-color: rgb(226, 232, 240)')
    expect(guides[1].attributes('style')).toContain('--gr-tree-branch-line-color: rgb(14, 165, 233)')
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

    ;(wrapper.vm as any).setCurrentKey(2)
    await nextTick()

    const child = wrapper.findAll('[data-gr-tree-node]')[1]
    const guides = child.findAll('[data-gr-tree-branch-guide]')
    expect(guides).toHaveLength(1)
    expect(guides[0].attributes('style')).toContain('--gr-tree-branch-line-color: rgb(14, 165, 233)')
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
    expect(wrapper.findAll('.gr-tree__row')).toHaveLength(1)

    ;(wrapper.vm as any).filter('Child B')
    await nextTick()

    // Parent + matched child.
    const rowsAfter = wrapper.findAll('.gr-tree__row')
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
    const labels = wrapper.findAll('.gr-tree__label').map(node => node.text())
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

    await wrapper.get('.gr-tree__row').trigger('click')
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

    const rows = wrapper.findAll('.gr-tree__row')
    const parentRow = rows[0]
    const childRow = rows[1]
    const parentChildren = Array.from(parentRow.element.children)

    expect(parentChildren[0]?.classList.contains('gr-tree__drag-handle')).toBe(true)
    expect(parentChildren[1]?.classList.contains('gr-tree__toggle')).toBe(true)

    const parentHandle = parentRow.get('.gr-tree__drag-handle')
    expect(parentHandle.classes()).not.toContain('gr-tree__drag-handle--visible')

    await parentRow.trigger('mouseenter')
    expect(parentHandle.classes()).toContain('gr-tree__drag-handle--visible')

    await parentRow.trigger('mouseleave')
    expect(parentHandle.classes()).not.toContain('gr-tree__drag-handle--visible')

    ;(wrapper.vm as any).setCurrentKey(1)
    await nextTick()

    await parentRow.trigger('mouseenter')
    expect(parentHandle.classes()).toContain('gr-tree__drag-handle--visible')

    const childHandle = childRow.get('.gr-tree__drag-handle')
    await childRow.trigger('mouseenter')
    expect(childHandle.classes()).toContain('gr-tree__drag-handle--visible')
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

    const rows = wrapper.findAll('.gr-tree__row')
    const dragRow = rows[1]
    const dropRow = rows[2]

    const dragHandle = dragRow.get('.gr-tree__drag-handle')

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

    const rows = wrapper.findAll('.gr-tree__row')
    const dragRow = rows[2]
    const dropRow = rows[1]

    const dragHandle = dragRow.get('.gr-tree__drag-handle')

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
    expect(wrapper.findAll('.gr-tree__row').map(row => row.text())).toEqual([
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

    const rows = wrapper.findAll('.gr-tree__row')
    const dragRow = rows[1]
    const dropRow = rows[2]

    const dragHandle = dragRow.get('.gr-tree__drag-handle')

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

describe('GrTree — WAI-ARIA tree pattern (item 23)', () => {
  it('использует roving tabindex: ровно один treeitem с tabindex=0', () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
      },
    })

    const items = wrapper.findAll('[role="treeitem"]')
    const focusable = items.filter(i => i.attributes('tabindex') === '0')
    expect(focusable).toHaveLength(1)
    // Остальные — недостижимы табом (roving).
    expect(items.filter(i => i.attributes('tabindex') === '-1')).toHaveLength(items.length - 1)
  })

  it('проставляет aria-selected на выбранном узле', async () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
      },
    })

    ;(wrapper.vm as any).setCurrentKey(2)
    await nextTick()

    const selected = wrapper.findAll('[role="treeitem"]').filter(i => i.attributes('aria-selected') === 'true')
    expect(selected).toHaveLength(1)
    expect(selected[0].attributes('data-gr-tree-node-key')).toBe('2')
  })

  it('ArrowRight раскрывает свёрнутую папку, ArrowLeft — сворачивает', async () => {
    const wrapper = mount(GrTree<Item>, {
      attachTo: document.body,
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [],
      },
    })

    // Свёрнуто: видна только корневая нода.
    expect(wrapper.findAll('.gr-tree__row')).toHaveLength(1)

    const tree$ = wrapper.get('[role="tree"]')
    await tree$.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(wrapper.emitted('nodeExpand')).toBeTruthy()
    expect(wrapper.findAll('.gr-tree__row').length).toBeGreaterThan(1)

    await tree$.trigger('keydown', { key: 'ArrowLeft' })
    await nextTick()
    expect(wrapper.emitted('nodeCollapse')).toBeTruthy()
    expect(wrapper.findAll('.gr-tree__row')).toHaveLength(1)

    wrapper.unmount()
  })

  it('Enter выбирает узел, на котором roving-фокус', async () => {
    const wrapper = mount(GrTree<Item>, {
      attachTo: document.body,
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
      },
    })

    const tree$ = wrapper.get('[role="tree"]')
    // Из корня шагаем вниз к первому ребёнку и выбираем.
    await tree$.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await tree$.trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(wrapper.emitted('nodeClick')?.at(-1)?.[0]).toMatchObject({ id: 2 })
    wrapper.unmount()
  })
})

describe('GrTree — клавиатура сверх стрелок', () => {
  function mountTree(props: Record<string, unknown> = {}) {
    return mount(GrTree<Item>, {
      attachTo: document.body,
      props: {
        data: treeWithNestedFolder(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
        ...props,
      },
    })
  }

  it('typeahead переводит фокус на узел по первым буквам', async () => {
    const wrapper = mountTree()
    const tree$ = wrapper.get('[role="tree"]')

    await tree$.trigger('keydown', { key: 'c' })
    await nextTick()

    const focusable = wrapper.findAll('[role="treeitem"]').filter(i => i.attributes('tabindex') === '0')
    expect(focusable).toHaveLength(1)
    expect(focusable[0].attributes('data-gr-tree-node-key')).toBe('3')

    wrapper.unmount()
  })

  it('повтор той же буквы идёт по кругу, а не ищет «ff»', async () => {
    const wrapper = mount(GrTree<Item>, {
      attachTo: document.body,
      props: {
        data: [
          { id: 1, label: 'Alpha' },
          { id: 2, label: 'Foo' },
          { id: 3, label: 'Fee' },
        ] satisfies Item[],
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
      },
    })
    const tree$ = wrapper.get('[role="tree"]')
    const focusedKey = () => wrapper.findAll('[role="treeitem"]')
      .find(i => i.attributes('tabindex') === '0')
      ?.attributes('data-gr-tree-node-key')

    await tree$.trigger('keydown', { key: 'f' })
    await nextTick()
    expect(focusedKey()).toBe('2')

    await tree$.trigger('keydown', { key: 'f' })
    await nextTick()
    expect(focusedKey()).toBe('3')

    wrapper.unmount()
  })

  it('`*` раскрывает всех соседей уровня', async () => {
    const wrapper = mount(GrTree<Item>, {
      attachTo: document.body,
      props: {
        data: [
          { id: 1, label: 'One', children: [{ id: 11, label: 'One child' }] },
          { id: 2, label: 'Two', children: [{ id: 21, label: 'Two child' }] },
        ] satisfies Item[],
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
      },
    })

    expect(wrapper.findAll('.gr-tree__row')).toHaveLength(2)

    await wrapper.get('[role="tree"]').trigger('keydown', { key: '*' })
    await nextTick()

    expect(wrapper.findAll('.gr-tree__row')).toHaveLength(4)
    expect(wrapper.emitted('nodeExpand')).toHaveLength(2)

    wrapper.unmount()
  })

  it('focus() из expose ставит фокус на узел', async () => {
    const wrapper = mountTree()

    const instance = wrapper.vm as unknown as { focus: (key?: number) => boolean }
    expect(instance.focus(3)).toBe(true)
    await nextTick()

    expect((document.activeElement as HTMLElement).getAttribute('data-gr-tree-node-key')).toBe('3')

    wrapper.unmount()
  })
})

describe('GrTree — раскрытие', () => {
  it('defaultExpandAll раскрывает дерево целиком и не отменяет ручное сворачивание', async () => {
    const data = treeWithNestedFolder()
    const wrapper = mount(GrTree<Item>, {
      props: {
        data,
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandAll: true,
      },
    })

    // Parent + Folder + Grandchild + Child B.
    expect(wrapper.findAll('.gr-tree__row')).toHaveLength(4)

    await wrapper.findAll('[data-gr-tree-toggle]')[0].trigger('click')
    await nextTick()
    expect(wrapper.findAll('.gr-tree__row')).toHaveLength(1)

    // Обновление данных не разворачивает свёрнутое обратно.
    await wrapper.setProps({ data: [...data] })
    await nextTick()
    expect(wrapper.findAll('.gr-tree__row')).toHaveLength(1)
  })

  it('expandOnClickNode раскрывает узел кликом по строке, Enter — по-прежнему только выбирает', async () => {
    const wrapper = mount(GrTree<Item>, {
      attachTo: document.body,
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        expandOnClickNode: true,
      },
    })

    await wrapper.get('.gr-tree__row').trigger('click')
    await nextTick()
    expect(wrapper.findAll('.gr-tree__row')).toHaveLength(3)

    await wrapper.get('[role="tree"]').trigger('keydown', { key: 'Enter' })
    await nextTick()
    // Enter не свернул узел обратно.
    expect(wrapper.findAll('.gr-tree__row')).toHaveLength(3)

    wrapper.unmount()
  })

  it('accordion оставляет раскрытым один узел на уровне', async () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: [
          { id: 1, label: 'One', children: [{ id: 11, label: 'One child' }] },
          { id: 2, label: 'Two', children: [{ id: 21, label: 'Two child' }] },
        ] satisfies Item[],
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        accordion: true,
      },
    })

    const toggles = () => wrapper.findAll('[data-gr-tree-toggle]')
    await toggles()[0].trigger('click')
    await nextTick()
    expect(wrapper.findAll('.gr-tree__row')).toHaveLength(3)

    await toggles()[1].trigger('click')
    await nextTick()

    // Первый узел свернулся сам, видимых строк по-прежнему три.
    expect(wrapper.findAll('.gr-tree__row')).toHaveLength(3)
    expect(wrapper.findAll('.gr-tree__row')[2].text()).toContain('Two child')
  })

  it('nodeContextMenu отдаёт событие, данные и узел', async () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
      },
    })

    await wrapper.get('.gr-tree__row').trigger('contextmenu')

    const emitted = wrapper.emitted('nodeContextMenu')?.at(-1)
    expect(emitted?.[1]).toMatchObject({ id: 1 })
    expect((emitted?.[2] as { key: number }).key).toBe(1)
  })
})

describe('GrTree — drag & drop', () => {
  it('drop гасит дефолт браузера до всех проверок', async () => {
    const wrapper = mount(GrTree<Item>, {
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
      },
    })

    const event = new Event('drop', { bubbles: true, cancelable: true })
    wrapper.get('.gr-tree__row').element.dispatchEvent(event)
    await nextTick()

    // Дерево не draggable, перетаскивания нет — но открывать бросённый файл
    // поверх страницы браузер всё равно не должен.
    expect(event.defaultPrevented).toBe(true)
  })
})

describe('GrTree — интерактив внутри узлов', () => {
  const DATA = [
    { id: 1, label: 'Root', children: [{ id: 11, label: 'Child' }] },
    { id: 2, label: 'Leaf' },
  ]

  it('toggle и drag-handle не табируемы: композит держит один таб-стоп', () => {
    const wrapper = mount(GrTree, {
      props: { data: DATA, nodeKey: 'id', draggable: true },
      attachTo: document.body,
    })

    const toggle = wrapper.get('[data-gr-tree-toggle]')
    const handle = wrapper.get('[data-gr-tree-drag-handle]')
    expect(toggle.attributes('tabindex')).toBe('-1')
    expect(handle.attributes('tabindex')).toBe('-1')

    wrapper.unmount()
  })

  it('Enter на toggle-кнопке не активирует строку с roving-фокусом', async () => {
    const wrapper = mount(GrTree, {
      props: { data: DATA, nodeKey: 'id' },
      attachTo: document.body,
    })

    const toggle = wrapper.get('[data-gr-tree-toggle]').element as HTMLElement
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    toggle.dispatchEvent(event)
    await nextTick()

    // Делегированная клавиатура уважает интерактивную цель: клик кнопки — её.
    expect(event.defaultPrevented).toBe(false)
    expect(wrapper.emitted('nodeClick')).toBeUndefined()

    wrapper.unmount()
  })

  it('клик по toggle не отнимает у дерева навигацию стрелками', async () => {
    const wrapper = mount(GrTree, {
      props: { data: DATA, nodeKey: 'id' },
      attachTo: document.body,
    })

    const toggle = wrapper.get('[data-gr-tree-toggle]').element as HTMLButtonElement
    // Браузер фокусирует кликнутую кнопку, `tabindex="-1"` этому не мешает.
    toggle.focus()
    await wrapper.get('[data-gr-tree-toggle]').trigger('click')

    toggle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))
    await nextTick()
    await nextTick()

    expect(document.activeElement?.getAttribute('data-gr-tree-node-key')).toBe('11')

    wrapper.unmount()
  })

  it('печать в контроле внутри слота узла не перехватывается typeahead', async () => {
    const wrapper = mount(GrTree, {
      props: { data: DATA, nodeKey: 'id' },
      slots: { default: '<input data-inline-edit type="text">' },
      attachTo: document.body,
    })

    const input = wrapper.findAll('[data-inline-edit]')[0].element as HTMLInputElement
    input.focus()
    const event = new KeyboardEvent('keydown', { key: 'l', bubbles: true, cancelable: true })
    input.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)

    wrapper.unmount()
  })
})

/**
 * Кольцо roving-фокуса собрано на общем `useRovingFocus`. Раньше инвариант
 * «ровно один `treeitem` с `tabindex=0`» держала ручная нормализация с
 * `watch(..., { flush: 'sync' })`; теперь он следует из того, что роверный узел
 * вычисляется, а не хранится.
 */
describe('GrTree — остановка Tab', () => {
  function mountTree(props: Record<string, unknown> = {}) {
    return mount(GrTree<Item>, {
      props: {
        data: tree(),
        nodeKey: 'id',
        props: { children: 'children', label: 'label' },
        defaultExpandedKeys: [1],
        ...props,
      },
      attachTo: document.body,
    })
  }

  function stops(wrapper: ReturnType<typeof mountTree>) {
    return wrapper.findAll('[role="treeitem"]')
      .filter(item => item.attributes('tabindex') === '0')
      .map(item => item.text())
  }

  it('свёрнутый родитель не забирает у дерева остановку Tab', async () => {
    // Узел, державший остановку, исчезает из видимых строк — остановка обязана
    // переехать на видимый. Это и делала ручная нормализация.
    const wrapper = mountTree()
    const tree = wrapper.get('[role="tree"]')

    // Клавиатура делегирована корню: позиция берётся из кольца, а не из цели
    // события. Стартовая остановка — корневой узел.
    await tree.trigger('keydown', { key: 'ArrowDown' })
    await tree.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(stops(wrapper)).toEqual(['Child B'])

    // Сворачиваем родителя мышью — остановка при этом остаётся на ребёнке,
    // который вот-вот исчезнет из разметки. Клавиатурой так не получится:
    // `ArrowLeft` с листа сперва уводит к родителю.
    await wrapper.get('[data-gr-tree-toggle]').trigger('click')
    await nextTick()

    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(1)
    expect(stops(wrapper)).toEqual(['Parent'])

    wrapper.unmount()
  })

  it('стрелка вниз на последней строке гасится, но никуда не ведёт', async () => {
    // Без гашения страница под деревом прокрутилась бы: у дерева нет
    // зацикливания, но клавиша всё равно наша.
    const wrapper = mountTree()
    const tree = wrapper.get('[role="tree"]')

    await tree.trigger('keydown', { key: 'End' })
    await nextTick()
    expect(stops(wrapper)).toEqual(['Child B'])

    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    wrapper.get('[role="tree"]').element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(stops(wrapper)).toEqual(['Child B'])

    wrapper.unmount()
  })

  it('пустое дерево остановок не создаёт', () => {
    const wrapper = mountTree({ data: [] })

    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(0)

    wrapper.unmount()
  })
})
