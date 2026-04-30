import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/arrow-up', () => {
  return {
    default: defineComponent({
      name: 'IconArrowUp',
      render: () => h('svg', { 'data-icon': 'arrow-up' }),
    }),
  }
})
vi.mock('~icons/lucide/arrow-down', () => {
  return {
    default: defineComponent({
      name: 'IconArrowDown',
      render: () => h('svg', { 'data-icon': 'arrow-down' }),
    }),
  }
})

import GrDataTable from '../GrDataTable.vue'

describe('GrDataTable', () => {
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'score', label: 'Score', sortable: true, align: 'right' as const },
    { key: 'note', label: 'Note' },
  ]
  const rows = [
    { id: 1, name: 'Charlie', score: 20, note: 'c' },
    { id: 2, name: 'Alice', score: 10, note: 'a' },
    { id: 3, name: 'Bob', score: 15, note: 'b' },
  ]

  it('сортирует строки по числовой колонке и переключает направление', async () => {
    const wrapper = mount(GrDataTable, { props: { columns, rows } })
    const scoreButton = wrapper.findAll('thead button')[1]

    await scoreButton.trigger('click')
    expect(wrapper.find('svg[data-icon="arrow-up"]').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr').map(r => r.text())).toEqual([
      'Alice10a',
      'Bob15b',
      'Charlie20c',
    ])

    await scoreButton.trigger('click')
    expect(wrapper.find('svg[data-icon="arrow-down"]').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr').map(r => r.text())).toEqual([
      'Charlie20c',
      'Bob15b',
      'Alice10a',
    ])
  })

  it('поддерживает initial sort и scoped slot ячейки', () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows, initialSortKey: 'name' },
      slots: { 'cell-score': ({ row }: { row: { score: number } }) => `#${row.score}` },
    })
    expect(wrapper.findAll('tbody tr').map(r => r.text())).toEqual([
      'Alice#10a',
      'Bob#15b',
      'Charlie#20c',
    ])
    expect(wrapper.find('svg[data-icon="arrow-up"]').exists()).toBe(true)
    expect(wrapper.find('tbody td.text-right').text()).toBe('#10')
  })

  it('несортируемая колонка рендерится как span без кнопки', () => {
    const wrapper = mount(GrDataTable, { props: { columns, rows } })
    const headers = wrapper.findAll('thead th')
    expect(headers).toHaveLength(3)
    expect(headers[2].find('button').exists()).toBe(false)
    expect(headers[2].attributes('aria-sort')).toBeUndefined()
  })

  it('aria-sort отражает текущее состояние сортировки', async () => {
    const wrapper = mount(GrDataTable, { props: { columns, rows } })
    const headers = wrapper.findAll('thead th')
    expect(headers[0].attributes('aria-sort')).toBe('none')
    expect(headers[1].attributes('aria-sort')).toBe('none')

    await wrapper.findAll('thead button')[0].trigger('click')
    expect(wrapper.findAll('thead th')[0].attributes('aria-sort')).toBe('ascending')
    expect(wrapper.findAll('thead th')[1].attributes('aria-sort')).toBe('none')

    await wrapper.findAll('thead button')[0].trigger('click')
    expect(wrapper.findAll('thead th')[0].attributes('aria-sort')).toBe('descending')
  })

  it('рендерит empty slot при rows=[]', () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows: [] },
      slots: { empty: () => 'Ничего не найдено' },
    })
    expect(wrapper.find('[data-ds-datatable-empty]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Ничего не найдено')
    expect(wrapper.findAll('[data-ds-datatable-row]')).toHaveLength(0)
  })

  it('прокидывает ariaLabel и caption в GrTable', () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows, ariaLabel: 'Users', caption: 'Список пользователей' },
    })
    expect(wrapper.find('table').attributes('aria-label')).toBe('Users')
    expect(wrapper.find('caption').text()).toBe('Список пользователей')
  })

  it('поддерживает rowKey как функцию', () => {
    const wrapper = mount(GrDataTable, {
      props: {
        columns,
        rows,
        rowKey: (row: { id: number }) => `row-${row.id}`,
      },
    })
    expect(wrapper.findAll('[data-ds-datatable-row]')).toHaveLength(3)
  })
})
