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

type Row = { id: number, name: string, score: number, note: string }

describe('GrDataTable', () => {
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'score', label: 'Score', sortable: true, align: 'right' as const },
    { key: 'note', label: 'Note' },
  ]
  const rows: Row[] = [
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
    const wrapper = mount(GrDataTable<Row>, {
      props: { columns, rows, initialSortKey: 'name' },
      slots: { 'cell-score': ({ row }: { row: Row }) => `#${row.score}` },
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
    expect(wrapper.find('[data-gr-datatable-empty]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Ничего не найдено')
    expect(wrapper.findAll('[data-gr-datatable-row]')).toHaveLength(0)
  })

  it('прокидывает ariaLabel и caption в GrTable', () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows, ariaLabel: 'Users', caption: 'Список пользователей' },
    })
    expect(wrapper.find('table').attributes('aria-label')).toBe('Users')
    expect(wrapper.find('caption').text()).toBe('Список пользователей')
  })

  it('поддерживает rowKey как функцию', () => {
    const wrapper = mount(GrDataTable<Row>, {
      props: {
        columns,
        rows,
        rowKey: (row: Row) => `row-${row.id}`,
      },
    })
    expect(wrapper.findAll('[data-gr-datatable-row]')).toHaveLength(3)
  })
})

describe('GrDataTable — controlled sort (item 27)', () => {
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'score', label: 'Score', sortable: true },
  ]
  const rows = [
    { id: 1, name: 'Charlie', score: 20 },
    { id: 2, name: 'Alice', score: 10 },
    { id: 3, name: 'Bob', score: 15 },
  ]

  it('controlled: рендерит по пропам sortKey/sortDir и эмитит update + sortChange', async () => {
    const wrapper = mount(GrDataTable, { props: { columns, rows, sortKey: 'score', sortDir: 'asc' } })
    expect(wrapper.findAll('tbody tr').map(r => r.text())).toEqual(['Alice10', 'Bob15', 'Charlie20'])

    await wrapper.findAll('thead button')[1].trigger('click')
    expect(wrapper.emitted('update:sortKey')?.at(-1)).toEqual(['score'])
    expect(wrapper.emitted('update:sortDir')?.at(-1)).toEqual(['desc'])
    expect(wrapper.emitted('sortChange')?.at(-1)).toEqual([{ key: 'score', dir: 'desc' }])

    // Пропы извне не менялись — отображаемая сортировка осталась asc.
    expect(wrapper.findAll('tbody tr').map(r => r.text())).toEqual(['Alice10', 'Bob15', 'Charlie20'])
  })

  it('externalSort: не сортирует rows сам, только эмитит смену', async () => {
    const wrapper = mount(GrDataTable, { props: { columns, rows, externalSort: true, sortKey: 'score', sortDir: 'asc' } })
    expect(wrapper.findAll('tbody tr').map(r => r.text())).toEqual(['Charlie20', 'Alice10', 'Bob15'])

    await wrapper.findAll('thead button')[1].trigger('click')
    expect(wrapper.emitted('sortChange')?.at(-1)).toEqual([{ key: 'score', dir: 'desc' }])
    expect(wrapper.findAll('tbody tr').map(r => r.text())).toEqual(['Charlie20', 'Alice10', 'Bob15'])
  })

  it('uncontrolled режим по-прежнему сортирует сам', async () => {
    const wrapper = mount(GrDataTable, { props: { columns, rows } })
    await wrapper.findAll('thead button')[1].trigger('click')
    expect(wrapper.findAll('tbody tr').map(r => r.text())).toEqual(['Alice10', 'Bob15', 'Charlie20'])
    expect(wrapper.emitted('sortChange')?.at(-1)).toEqual([{ key: 'score', dir: 'asc' }])
  })

  // `aria-label` на кнопке подменял собой имя `<th>`: AT при переходе по ячейкам
  // вместо «Имя» читала «Отсортировано по Имя по возрастанию, нажмите…».
  it('имя кнопки сортировки — подпись колонки, подсказка идёт отдельным скрытым текстом', async () => {
    const messages: Record<string, string> = {
      'gr.dataTable.sortAsc': 'Нажмите для сортировки по возрастанию',
      'gr.dataTable.sortDesc': 'Нажмите для сортировки по убыванию',
    }
    const wrapper = mount(GrDataTable, {
      props: {
        rows: [{ id: 1, name: 'Alice' }],
        columns: [{ key: 'name', label: 'Имя', sortable: true }],
      },
      global: {
        provide: {
          [Symbol.for('FintI18n')]: {
            t: (key: string) => messages[key] ?? key,
          },
        },
      },
    })

    const button = wrapper.find('thead button')
    expect(button.attributes('aria-label')).toBeUndefined()
    expect(button.find('.sr-only').text()).toBe('Нажмите для сортировки по возрастанию')
    // Имя колонки — первым, подсказка следом: она дополняет имя, а не заменяет его.
    expect(button.text().startsWith('Имя')).toBe(true)

    await button.trigger('click')
    expect(wrapper.find('thead th').attributes('aria-sort')).toBe('ascending')
    expect(wrapper.find('thead button .sr-only').text()).toBe('Нажмите для сортировки по убыванию')
  })

  it('sortCycle="asc-desc-none" третьим кликом снимает сортировку', async () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows, sortCycle: 'asc-desc-none' as const },
    })
    const scoreButton = wrapper.findAll('thead button')[1]

    await scoreButton.trigger('click')
    await scoreButton.trigger('click')
    await scoreButton.trigger('click')

    expect(wrapper.emitted('sortChange')?.at(-1)).toEqual([{ key: '', dir: 'asc' }])
    expect(wrapper.findAll('thead th')[1].attributes('aria-sort')).toBe('none')
    // Порядок вернулся к исходному, а не остался от последней сортировки.
    expect(wrapper.findAll('tbody tr').map(r => r.text())).toEqual(['Charlie20', 'Alice10', 'Bob15'])
  })
})

describe('GrDataTable — выбор строк', () => {
  const columns = [{ key: 'name', label: 'Name' }]
  const rows = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ]

  function selectRowCheckboxes(wrapper: ReturnType<typeof mount>) {
    return wrapper.findAll('[data-gr-datatable-select-row] [role="checkbox"]')
  }

  it('рисует чекбоксы дизайн-системы, а не нативные', () => {
    const wrapper = mount(GrDataTable, { props: { columns, rows, selectable: true } })

    expect(wrapper.findAll('[role="checkbox"]')).toHaveLength(rows.length + 1)
    expect(wrapper.find('input[type="checkbox"][class*="accent-"]').exists()).toBe(false)
  })

  // Без внутреннего состояния чекбоксы рисовались, кликались и никогда не отмечались.
  it('uncontrolled: клик отмечает строку и эмитит новый список ключей', async () => {
    const wrapper = mount(GrDataTable, { props: { columns, rows, selectable: true } })

    await selectRowCheckboxes(wrapper)[1].trigger('click')

    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([[2]])
    expect(wrapper.findAll('[data-gr-datatable-row][data-selected="true"]')).toHaveLength(1)

    await selectRowCheckboxes(wrapper)[1].trigger('click')
    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([[]])
    expect(wrapper.findAll('[data-gr-datatable-row][data-selected="true"]')).toHaveLength(0)
  })

  it('controlled: состояние приходит пропом, внутреннее не подменяет его', async () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows, selectable: true, selected: [1] },
    })

    expect(wrapper.findAll('[data-gr-datatable-row][data-selected="true"]')).toHaveLength(1)

    await selectRowCheckboxes(wrapper)[1].trigger('click')

    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([[1, 2]])
    // Проп не менялся — разметка тоже.
    expect(wrapper.findAll('[data-gr-datatable-row][data-selected="true"]')).toHaveLength(1)
  })

  it('«выбрать все»: indeterminate при частичном выборе, снятие возвращает пустой список', async () => {
    const wrapper = mount(GrDataTable, { props: { columns, rows, selectable: true } })
    const selectAll = () => wrapper.find('[data-gr-datatable-select-all] [role="checkbox"]')

    await selectRowCheckboxes(wrapper)[0].trigger('click')
    expect(selectAll().attributes('aria-checked')).toBe('mixed')

    await selectAll().trigger('click')
    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([[1, 2, 3]])
    expect(selectAll().attributes('aria-checked')).toBe('true')

    await selectAll().trigger('click')
    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([[]])
  })

  it('selectableRow исключает строку из выбора и из «выбрать все»', async () => {
    const wrapper = mount(GrDataTable, {
      props: {
        columns,
        rows,
        selectable: true,
        selectableRow: (row: Record<string, unknown>) => row.id !== 2,
      },
    })

    expect(selectRowCheckboxes(wrapper)).toHaveLength(2)

    await wrapper.find('[data-gr-datatable-select-all] [role="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([[1, 3]])
  })

  it('«выбрать все» недоступен, когда выбирать нечего', () => {
    const wrapper = mount(GrDataTable, { props: { columns, rows: [], selectable: true } })

    expect(wrapper.find('[data-gr-datatable-select-all] [role="checkbox"]').attributes('aria-disabled')).toBe('true')
  })

  // `String(undefined ?? '')` давал один и тот же ключ всем строкам: выбор одной
  // помечал выбранными все, а Vue переиспользовал DOM не по назначению.
  it('строки без rowKey получают разные ключи, а не общий пустой', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const anonymous = [{ name: 'Alice' }, { name: 'Bob' }]

    const wrapper = mount(GrDataTable, { props: { columns, rows: anonymous, selectable: true } })

    const keys = wrapper.findAll('[data-gr-datatable-row]').map(r => r.attributes('data-row-key'))
    expect(new Set(keys).size).toBe(2)

    await selectRowCheckboxes(wrapper)[0].trigger('click')
    expect(wrapper.findAll('[data-gr-datatable-row][data-selected="true"]')).toHaveLength(1)

    // Предупреждение одно на таблицу, а не на строку.
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('GrDataTable')
    warn.mockRestore()
  })

  it('ключ строки переживает сортировку: выбранной остаётся та же строка', async () => {
    const wrapper = mount(GrDataTable, {
      props: {
        columns: [{ key: 'name', label: 'Name', sortable: true }],
        rows,
        selectable: true,
      },
    })

    await selectRowCheckboxes(wrapper)[2].trigger('click')
    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([[3]])

    await wrapper.find('thead button').trigger('click')

    const selectedRow = wrapper.find('[data-gr-datatable-row][data-selected="true"]')
    expect(selectedRow.text()).toContain('Charlie')
  })
})

describe('GrDataTable — строки, слоты и состояния', () => {
  const columns = [{ key: 'name', label: 'Name' }]
  const rows = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]

  it('эмитит rowClick со строкой, индексом и событием', async () => {
    const wrapper = mount(GrDataTable, { props: { columns, rows } })

    await wrapper.findAll('[data-gr-datatable-row]')[1].trigger('click')

    const payload = wrapper.emitted('rowClick')?.[0]?.[0] as { row: unknown, index: number }
    expect(payload.row).toEqual(rows[1])
    expect(payload.index).toBe(1)
  })

  it('rowClass и rowProps доезжают до строки', () => {
    const wrapper = mount(GrDataTable, {
      props: {
        columns,
        rows,
        rowClass: (row: Record<string, unknown>) => (row.id === 2 ? 'row-danger' : undefined),
        rowProps: (row: Record<string, unknown>) => ({ 'data-row-id': row.id }),
      },
    })

    const items = wrapper.findAll('[data-gr-datatable-row]')
    expect(items[0].classes()).not.toContain('row-danger')
    expect(items[1].classes()).toContain('row-danger')
    expect(items[0].attributes('data-row-id')).toBe('1')
  })

  it('слот #header-<key> заменяет подпись колонки, не ломая сортировку', async () => {
    const wrapper = mount(GrDataTable, {
      props: { columns: [{ key: 'name', label: 'Name', sortable: true }], rows },
      slots: { 'header-name': '<em data-custom-header>Имя</em>' },
    })

    expect(wrapper.find('[data-custom-header]').exists()).toBe(true)

    await wrapper.find('thead button').trigger('click')
    expect(wrapper.find('thead th').attributes('aria-sort')).toBe('ascending')
  })

  it('emptyText задаёт текст пустого состояния, слот #empty сильнее', () => {
    const withText = mount(GrDataTable, {
      props: { columns, rows: [], emptyText: 'Ничего не найдено' },
    })
    expect(withText.find('[data-gr-datatable-empty]').text()).toBe('Ничего не найдено')

    const withSlot = mount(GrDataTable, {
      props: { columns, rows: [], emptyText: 'Ничего не найдено' },
      slots: { empty: '<span>Свой пустой экран</span>' },
    })
    expect(withSlot.find('[data-gr-datatable-empty]').text()).toBe('Свой пустой экран')
  })

  it('слот #loading заменяет индикатор загрузки', () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows, loading: true },
      slots: { loading: '<span data-custom-loader>Тянем данные…</span>' },
    })

    expect(wrapper.find('[data-custom-loader]').exists()).toBe(true)
    expect(wrapper.findAll('[data-gr-datatable-row]')).toHaveLength(0)
  })

  // Регион, который появляется уже с текстом, часть AT не объявляет вовсе.
  it('живой регион существует с первого рендера и пуст, пока объявлять нечего', async () => {
    const wrapper = mount(GrDataTable, { props: { columns, rows } })

    const live = wrapper.find('[data-gr-datatable-live]')
    expect(live.exists()).toBe(true)
    expect(live.attributes('role')).toBe('status')
    expect(live.text()).toBe('')

    await wrapper.setProps({ loading: true })
    expect(wrapper.find('[data-gr-datatable-live]').text()).toBe('Loading…')

    await wrapper.setProps({ loading: false, rows: [] })
    expect(wrapper.find('[data-gr-datatable-live]').text()).toBe('No data')
  })

  it('экспонирует scrollToRow, clearSort и toggleAll', async () => {
    const wrapper = mount(GrDataTable, {
      props: { columns: [{ key: 'name', label: 'Name', sortable: true }], rows, selectable: true },
      attachTo: document.body,
    })

    const api = wrapper.vm as unknown as {
      scrollToRow: (key: string | number) => boolean
      clearSort: () => void
      toggleAll: () => void
    }

    const row = wrapper.find('[data-row-key="2"]').element as HTMLElement
    const scrollIntoView = vi.fn()
    row.scrollIntoView = scrollIntoView

    expect(api.scrollToRow(2)).toBe(true)
    expect(scrollIntoView).toHaveBeenCalled()
    expect(api.scrollToRow('нет такой строки')).toBe(false)

    api.toggleAll()
    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([[1, 2]])

    await wrapper.find('thead button').trigger('click')
    api.clearSort()
    expect(wrapper.emitted('sortChange')?.at(-1)).toEqual([{ key: '', dir: 'asc' }])

    wrapper.unmount()
  })
})

describe('GrDataTable — клик по чекбоксу выбора строки', () => {
  it('переключает выбор, но не эмитит rowClick', async () => {
    const wrapper = mount(GrDataTable, {
      props: {
        rows: [{ id: 1, name: 'Ada' }, { id: 2, name: 'Linus' }],
        columns: [{ key: 'name', label: 'Имя' }],
        selectable: true,
      },
      attachTo: document.body,
    })

    const rowCheckbox = wrapper.get('[data-gr-datatable-select-row]')
    await rowCheckbox.trigger('click')

    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([[1]])
    // Сам чекбокс — не «строка»: навигационный клик не должен уходить.
    expect(wrapper.emitted('rowClick')).toBeUndefined()

    wrapper.unmount()
  })

  it('служебная ячейка невыбираемой строки — обычная ячейка, а не мёртвая зона', async () => {
    const wrapper = mount(GrDataTable, {
      props: {
        rows: [{ id: 1, name: 'Ada' }, { id: 2, name: 'Linus' }],
        columns: [{ key: 'name', label: 'Имя' }],
        selectable: true,
        selectableRow: (row: Record<string, unknown>) => row.id === 1,
      },
      attachTo: document.body,
    })

    const secondRow = wrapper.findAll('[data-gr-datatable-row]')[1]
    // Чекбокса тут нет — гасить нечего, и строка обязана кликаться целиком.
    expect(secondRow.find('[data-gr-datatable-select-row]').exists()).toBe(false)

    await secondRow.findAll('td')[0].trigger('click')

    expect((wrapper.emitted('rowClick')?.at(-1)?.[0] as { index: number }).index).toBe(1)

    wrapper.unmount()
  })
})
