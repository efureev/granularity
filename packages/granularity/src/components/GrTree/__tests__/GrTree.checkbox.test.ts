import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import GrTree from '../GrTree.vue'

type Item = { id: number, label: string, children?: Item[] }

function tree(): Item[] {
  return [
    {
      id: 1,
      label: 'Parent',
      children: [
        { id: 2, label: 'Child A' },
        { id: 3, label: 'Child B' },
      ],
    },
  ]
}

function mountTree(props: Record<string, unknown> = {}) {
  return mount(GrTree<Item>, {
    props: {
      data: tree(),
      nodeKey: 'id',
      props: { children: 'children', label: 'label' },
      defaultExpandedKeys: [1],
      showCheckbox: true,
      ...props,
    },
    attachTo: document.body,
  })
}

function items(wrapper: ReturnType<typeof mountTree>) {
  return wrapper.findAll('[role="treeitem"]')
}

describe('GrTree — чекбоксы', () => {
  it('без пропа чекбоксов нет и `aria-checked` не появляется', () => {
    const wrapper = mountTree({ showCheckbox: false })

    expect(wrapper.findAll('[data-gr-tree-checkbox]')).toHaveLength(0)
    expect(items(wrapper)[0].attributes('aria-checked')).toBeUndefined()
    expect(wrapper.get('[role="tree"]').attributes('aria-multiselectable')).toBeUndefined()

    wrapper.unmount()
  })

  it('состояние живёт на `treeitem`, а квадратик декоративен', async () => {
    const wrapper = mountTree()

    expect(wrapper.get('[role="tree"]').attributes('aria-multiselectable')).toBe('true')
    expect(items(wrapper).map(i => i.attributes('aria-checked'))).toEqual(['false', 'false', 'false'])
    // Внутрь роли-виджета нельзя класть интерактивное — квадратик скрыт от диктора.
    expect(wrapper.get('[data-gr-tree-checkbox]').attributes('aria-hidden')).toBe('true')

    await wrapper.findAll('[data-gr-tree-checkbox]')[1].trigger('click')

    expect(items(wrapper).map(i => i.attributes('aria-checked'))).toEqual(['mixed', 'true', 'false'])

    wrapper.unmount()
  })

  it('отметка родителя каскадится на детей, снятие — тоже', async () => {
    const wrapper = mountTree()

    await wrapper.get('[data-gr-tree-checkbox]').trigger('click')
    expect(items(wrapper).map(i => i.attributes('aria-checked'))).toEqual(['true', 'true', 'true'])

    await wrapper.get('[data-gr-tree-checkbox]').trigger('click')
    expect(items(wrapper).map(i => i.attributes('aria-checked'))).toEqual(['false', 'false', 'false'])

    wrapper.unmount()
  })

  it('`checkStrictly` разрывает связь родителя и детей', async () => {
    const wrapper = mountTree({ checkStrictly: true })

    await wrapper.get('[data-gr-tree-checkbox]').trigger('click')

    expect(items(wrapper).map(i => i.attributes('aria-checked'))).toEqual(['true', 'false', 'false'])

    wrapper.unmount()
  })

  it('эмитит `update:checkedKeys` и `check` со сводкой', async () => {
    const wrapper = mountTree()

    await wrapper.findAll('[data-gr-tree-checkbox]')[1].trigger('click')

    expect(wrapper.emitted('update:checkedKeys')?.at(-1)).toEqual([[2]])
    const check = wrapper.emitted('check')?.at(-1)
    expect(check?.[1]).toMatchObject({ key: 2 })
    expect(check?.[2]).toEqual({ checkedKeys: [2], halfCheckedKeys: [1] })

    wrapper.unmount()
  })

  it('клик по квадратику не выбирает строку', async () => {
    const wrapper = mountTree()

    await wrapper.findAll('[data-gr-tree-checkbox]')[1].trigger('click')

    expect(wrapper.emitted('nodeClick')).toBeUndefined()
    expect(items(wrapper)[1].attributes('aria-selected')).toBeUndefined()

    wrapper.unmount()
  })

  it('`defaultCheckedKeys` поднимает состояние родителя при монтировании', () => {
    const wrapper = mountTree({ defaultCheckedKeys: [2, 3] })

    expect(items(wrapper).map(i => i.attributes('aria-checked'))).toEqual(['true', 'true', 'true'])

    wrapper.unmount()
  })

  it('`checked-keys` управляется снаружи', async () => {
    const wrapper = mountTree({ checkedKeys: [] })

    await wrapper.setProps({ checkedKeys: [3] })
    await nextTick()

    expect(items(wrapper).map(i => i.attributes('aria-checked'))).toEqual(['mixed', 'false', 'true'])

    wrapper.unmount()
  })

  it('Space переключает отметку, Enter по-прежнему выбирает', async () => {
    const wrapper = mountTree()
    const root = wrapper.get('[role="tree"]')

    await root.trigger('keydown', { key: ' ' })
    expect(items(wrapper)[0].attributes('aria-checked')).toBe('true')
    expect(wrapper.emitted('nodeClick')).toBeUndefined()

    await root.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('nodeClick')).toHaveLength(1)

    wrapper.unmount()
  })

  it('без чекбоксов Space выбирает узел, как раньше', async () => {
    const wrapper = mountTree({ showCheckbox: false })

    await wrapper.get('[role="tree"]').trigger('keydown', { key: ' ' })

    expect(wrapper.emitted('nodeClick')).toHaveLength(1)

    wrapper.unmount()
  })

  it('императивный API отдаёт и принимает отметки', async () => {
    const wrapper = mountTree()
    const vm = wrapper.vm as unknown as {
      setCheckedKeys: (keys: number[]) => void
      getCheckedKeys: (options?: { leafOnly?: boolean }) => number[]
      getHalfCheckedKeys: () => number[]
      setChecked: (node: number, checked: boolean) => boolean
    }

    vm.setCheckedKeys([2])
    await nextTick()
    expect(vm.getCheckedKeys()).toEqual([2])
    expect(vm.getHalfCheckedKeys()).toEqual([1])

    expect(vm.setChecked(3, true)).toBe(true)
    await nextTick()
    expect(vm.getCheckedKeys()).toEqual([1, 2, 3])
    expect(vm.getCheckedKeys({ leafOnly: true })).toEqual([2, 3])

    wrapper.unmount()
  })
})
