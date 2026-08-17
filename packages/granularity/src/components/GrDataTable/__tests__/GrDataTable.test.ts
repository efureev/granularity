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

describe('GrDataTable — итоговая строка', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'score', label: 'Score' },
  ]
  const rows = [{ id: 1, name: 'Alice', score: 10 }]

  // Без скоупа потребитель повторял бы порядок, закрепление и колонку выбора
  // руками — и расходился с шапкой при первом же переносе колонки.
  it('#footer рендерится в tfoot и получает колонки со счётчиком', () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows, selectable: true },
      slots: {
        footer: `
          <template #default="{ columns: cols, totalColumns }">
            <tr data-summary>
              <td :colspan="totalColumns - 1">Итого ({{ cols.map(c => c.key).join(',') }})</td>
              <td>10</td>
            </tr>
          </template>
        `,
      },
    })

    const summary = wrapper.get('tfoot tr[data-summary]')
    // Колонка выбора учтена: 2 объявленных + 1 служебная.
    expect(summary.findAll('td')[0].attributes('colspan')).toBe('2')
    expect(summary.text()).toContain('name,score')
  })

  it('без summaryRow и без #footer tfoot не рендерится вовсе', () => {
    const wrapper = mount(GrDataTable, { props: { columns, rows } })

    expect(wrapper.find('tfoot').exists()).toBe(false)
  })

  it('summaryRow ставит значения под своими колонками, остальные оставляет пустыми', () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows, summaryRow: { score: 10 } },
    })

    const cells = wrapper.get('[data-gr-datatable-summary]').findAll('td')
    expect(cells).toHaveLength(2)
    expect(cells[0].text()).toBe('')
    expect(cells[1].text()).toBe('10')
    expect(cells[1].attributes('data-column-key')).toBe('score')
  })

  // Ради этого проп и заведён: собранная руками строка получает свои паддинги и
  // разъезжается с телом на первой же смене `size`.
  it('ячейка итога совпадает с ячейкой тела по сетке: паддинг, выравнивание, ширина', () => {
    const gridColumns = [
      { key: 'name', label: 'Name' },
      { key: 'score', label: 'Score', align: 'right' as const, width: 120 },
    ]

    const wrapper = mount(GrDataTable, {
      props: { columns: gridColumns, rows, size: 'lg', summaryRow: { name: 'Итого', score: 10 } },
    })

    const bodyCells = wrapper.get('[data-gr-datatable-row]').findAll('td')
    const summaryCells = wrapper.get('[data-gr-datatable-summary]').findAll('td')

    for (const index of [0, 1]) {
      expect(summaryCells[index].classes()).toEqual(bodyCells[index].classes())
      expect(summaryCells[index].attributes('style')).toBe(bodyCells[index].attributes('style'))
    }

    // Ступень `lg`, а не захардкоженная `sm`.
    expect(summaryCells[0].classes()).toContain('px-5')
    expect(summaryCells[1].classes()).toContain('text-right')
  })

  it('при selectable служебная ячейка есть и у итога — иначе колонки съедут', () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows, selectable: true, summaryRow: { name: 'Итого' } },
    })

    const summaryCells = wrapper.get('[data-gr-datatable-summary]').findAll('td')
    expect(summaryCells).toHaveLength(3)
    // Служебная ячейка пуста: выбирать итог нечем.
    expect(summaryCells[0].text()).toBe('')
    expect(summaryCells[1].text()).toBe('Итого')
  })

  it('закреплённая колонка липнет и в итоге, с тем же классом края', () => {
    const pinned = [
      { key: 'name', label: 'Name', pinned: 'left' as const },
      { key: 'score', label: 'Score' },
    ]

    const wrapper = mount(GrDataTable, {
      props: { columns: pinned, rows, summaryRow: { name: 'Итого' } },
    })

    const summaryCell = wrapper.get('[data-gr-datatable-summary]').findAll('td')[0]
    const bodyCell = wrapper.get('[data-gr-datatable-row]').findAll('td')[0]

    expect(summaryCell.classes()).toContain('sticky')
    expect(summaryCell.classes()).toEqual(bodyCell.classes())
  })

  it('columnOrder переставляет ячейки итога вместе с телом', () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows, columnOrder: ['score', 'name'], summaryRow: { name: 'Итого', score: 10 } },
    })

    const keys = wrapper.get('[data-gr-datatable-summary]')
      .findAll('td')
      .map(cell => cell.attributes('data-column-key'))

    expect(keys).toEqual(['score', 'name'])
  })

  it('слот #summary-<key> перебивает значение и получает его в скоупе', () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows, summaryRow: { score: 10 } },
      slots: {
        'summary-score': `
          <template #default="{ value, column }">
            <b data-slot>{{ column.label }}: {{ value }}</b>
          </template>
        `,
      },
    })

    expect(wrapper.get('[data-gr-datatable-summary] [data-slot]').text()).toBe('Score: 10')
  })

  // `0` — это значение, а не пустота: отличить «итог ноль» от «итога нет» иначе
  // было бы нечем.
  it('ноль печатается, отсутствующий ключ — нет', () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows, summaryRow: { name: 0 } },
    })

    const cells = wrapper.get('[data-gr-datatable-summary]').findAll('td')
    expect(cells[0].text()).toBe('0')
    expect(cells[1].text()).toBe('')
  })

  // `:summary-row="totals ?? null"` — обычная запись у потребителя. Предикат
  // обязан быть один: разойдись шаблон с `aria-rowcount`, диктор объявил бы
  // строку, которой в разметке нет.
  it('null — это «итога нет», как и отсутствие пропа', () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows, summaryRow: null },
    })

    expect(wrapper.find('[data-gr-datatable-summary]').exists()).toBe(false)
    expect(wrapper.find('tfoot').exists()).toBe(false)
  })

  // «Итого 1 234» над спиннером — утверждение о том, чего ещё не показали.
  it('во время загрузки итог скрыт, на пустом наборе — показан', () => {
    const loading = mount(GrDataTable, {
      props: { columns, rows, loading: true, summaryRow: { name: 'Итого' } },
    })
    expect(loading.find('[data-gr-datatable-summary]').exists()).toBe(false)

    const empty = mount(GrDataTable, {
      props: { columns, rows: [], summaryRow: { name: 'Итого' } },
    })
    // «Итого 0» под «нет данных» осмысленно: считает его потребитель.
    expect(empty.get('[data-gr-datatable-summary]').text()).toContain('Итого')
  })

  it('summaryRow и #footer сосуществуют: сначала итог, потом свободная разметка', () => {
    const wrapper = mount(GrDataTable, {
      props: { columns, rows, summaryRow: { name: 'Итого' } },
      slots: { footer: '<tr data-note><td>примечание</td></tr>' },
    })

    const footRows = wrapper.get('tfoot').findAll('tr')
    expect(footRows).toHaveLength(2)
    expect(footRows[0].attributes('data-gr-datatable-summary')).toBeDefined()
    expect(footRows[1].attributes('data-note')).toBeDefined()
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
