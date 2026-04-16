import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/arrow-up', () => {
  return {
    default: defineComponent({
      name: 'IconArrowUp',
      template: '<svg data-icon="arrow-up" />',
    }),
  }
})

vi.mock('~icons/lucide/arrow-down', () => {
  return {
    default: defineComponent({
      name: 'IconArrowDown',
      template: '<svg data-icon="arrow-down" />',
    }),
  }
})

import DsDataTable from '../DsDataTable.vue'

describe('DsDataTable', () => {
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'score', label: 'Score', sortable: true, align: 'right' as const },
  ]

  const rows = [
    { id: 1, name: 'Charlie', score: 20 },
    { id: 2, name: 'Alice', score: 10 },
    { id: 3, name: 'Bob', score: 15 },
  ]

  it('сортирует строки по числовой колонке и переключает направление', async () => {
    const wrapper = mount(DsDataTable, {
      props: {
        columns,
        rows,
      },
    })

    const scoreButton = wrapper.findAll('thead button')[1]

    await scoreButton.trigger('click')
    expect(wrapper.find('svg[data-icon="arrow-up"]').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr').map(row => row.text())).toEqual([
      'Alice10',
      'Bob15',
      'Charlie20',
    ])

    await scoreButton.trigger('click')
    expect(wrapper.find('svg[data-icon="arrow-down"]').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr').map(row => row.text())).toEqual([
      'Charlie20',
      'Bob15',
      'Alice10',
    ])
  })

  it('поддерживает initial sort и scoped slot ячейки', () => {
    const wrapper = mount(DsDataTable, {
      props: {
        columns,
        rows,
        initialSortKey: 'name',
      },
      slots: {
        'cell-score': ({ row }: { row: { score: number } }) => `#${row.score}`,
      },
    })

    expect(wrapper.findAll('tbody tr').map(row => row.text())).toEqual([
      'Alice#10',
      'Bob#15',
      'Charlie#20',
    ])
    expect(wrapper.find('svg[data-icon="arrow-up"]').exists()).toBe(true)
    expect(wrapper.find('tbody td.text-right').text()).toBe('#10')
  })
})