import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/arrow-up', () => ({
  default: defineComponent({ name: 'IconArrowUp', render: () => h('svg', { 'data-icon': 'arrow-up' }) }),
}))
vi.mock('~icons/lucide/arrow-down', () => ({
  default: defineComponent({ name: 'IconArrowDown', render: () => h('svg', { 'data-icon': 'arrow-down' }) }),
}))

import { resetAnnouncer } from '../../../composables/useAnnouncer'
import GrDataTable from '../GrDataTable.vue'
import { announced, cancelPointer, drag, move, press, stackRects } from '../../../testing'

type Row = { id: number, name: string, score: number, note: string }

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'score', label: 'Score' },
  { key: 'note', label: 'Note' },
]

const rows: Row[] = [
  { id: 1, name: 'Charlie', score: 20, note: 'c' },
  { id: 2, name: 'Alice', score: 10, note: 'a' },
]

function mountTable(props: Record<string, unknown> = {}) {
  return mount(GrDataTable, {
    props: { columns, rows, rowKey: 'id', ...props },
    attachTo: document.body,
  })
}

function headerKeys(wrapper: ReturnType<typeof mountTable>): string[] {
  return wrapper.findAll('thead th[data-column-key]').map(th => th.attributes('data-column-key') ?? '')
}

function resizers(wrapper: ReturnType<typeof mountTable>) {
  return wrapper.findAll('[data-gr-datatable-column-resizer]')
}

function handles(wrapper: ReturnType<typeof mountTable>) {
  return wrapper.findAll('[data-gr-datatable-column-handle]')
}

/** Колонки по 100px в ряд: в jsdom раскладки нет. */
function layout(wrapper: ReturnType<typeof mountTable>, width = 100): void {
  stackRects(wrapper.findAll('thead th').map(th => th.element), { size: width, axis: 'horizontal', cross: 40 })
}

function dragResizer(wrapper: ReturnType<typeof mountTable>, index: number, from: number, to: number): void {
  drag(resizers(wrapper)[index].element, { clientX: from }, { clientX: to })
}

afterEach(() => {
  resetAnnouncer()
})

describe('ширина колонок', () => {
  it('без `resizableColumns` ручек ширины нет', () => {
    const wrapper = mountTable()

    expect(resizers(wrapper)).toHaveLength(0)

    wrapper.unmount()
  })

  it('протяжка указателем задаёт ширину и отдаёт её наружу', async () => {
    const wrapper = mountTable({ resizableColumns: true })
    layout(wrapper)

    dragResizer(wrapper, 0, 100, 160)
    await nextTick()

    expect(wrapper.emitted('update:columnWidths')?.at(-1)?.[0]).toEqual({ name: 160 })
    expect(wrapper.emitted('columnResize')?.at(-1)?.[0]).toEqual({ key: 'name', width: 160 })
    expect(wrapper.find('thead th[data-column-key="name"]').attributes('style')).toContain('160px')

    wrapper.unmount()
  })

  it('уже минимума колонка не становится', async () => {
    const wrapper = mountTable({ resizableColumns: true })
    layout(wrapper)

    dragResizer(wrapper, 0, 100, -400)
    await nextTick()

    expect(wrapper.emitted('columnResize')?.at(-1)?.[0]).toEqual({ key: 'name', width: 48 })

    wrapper.unmount()
  })

  it('оборванный жест возвращает ширину, которая была до нажатия', async () => {
    const wrapper = mountTable({ resizableColumns: true })
    layout(wrapper)

    press(resizers(wrapper)[0].element, { clientX: 100 })
    move({ clientX: 200 })
    cancelPointer()
    await nextTick()

    expect(wrapper.emitted('update:columnWidths')?.at(-1)?.[0]).toEqual({})
    expect(wrapper.emitted('columnResize')).toBeUndefined()

    wrapper.unmount()
  })

  it('стрелки меняют ширину шагом, `Shift` — крупным', async () => {
    const wrapper = mountTable({ resizableColumns: true })
    layout(wrapper)

    await resizers(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('columnResize')?.at(-1)?.[0]).toEqual({ key: 'name', width: 116 })

    await resizers(wrapper)[0].trigger('keydown', { key: 'ArrowLeft', shiftKey: true })
    expect(wrapper.emitted('columnResize')?.at(-1)?.[0]).toEqual({ key: 'name', width: 68 })

    wrapper.unmount()
  })

  it('`Enter` и двойной клик возвращают колонку к авторазметке', async () => {
    const wrapper = mountTable({ resizableColumns: true })
    layout(wrapper)

    await resizers(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })
    await resizers(wrapper)[0].trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:columnWidths')?.at(-1)?.[0]).toEqual({})

    await resizers(wrapper)[1].trigger('keydown', { key: 'ArrowRight' })
    await resizers(wrapper)[1].trigger('dblclick')
    expect(wrapper.emitted('update:columnWidths')?.at(-1)?.[0]).toEqual({})

    wrapper.unmount()
  })

  it('объявляет ширину скринридеру и держит её в `aria-valuenow`', async () => {
    const wrapper = mountTable({ resizableColumns: true })
    layout(wrapper)

    await resizers(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })

    expect(await announced()).toBe('Column Name is 116 pixels wide')
    expect(resizers(wrapper)[0].attributes('aria-valuenow')).toBe('116')
    expect(resizers(wrapper)[0].attributes('aria-valuemin')).toBe('48')

    wrapper.unmount()
  })

  // Фокусируемый `separator` без `aria-valuenow` — критическое нарушение axe,
  // а до первой протяжки заданной ширины у колонки нет вовсе.
  it('называет ширину с первого рендера, до всякой протяжки', () => {
    const wrapper = mountTable({
      resizableColumns: true,
      columns: [{ key: 'name', label: 'Name' }, { key: 'score', label: 'Score', width: 120 }],
    })

    expect(resizers(wrapper)[0].attributes('aria-valuenow')).toBe('48')
    expect(resizers(wrapper)[1].attributes('aria-valuenow')).toBe('120')
    expect(resizers(wrapper)[1].attributes('aria-valuetext')).toBe('120px')

    wrapper.unmount()
  })

  it('контролируемые `columnWidths` задают ширину', () => {
    const wrapper = mountTable({ resizableColumns: true, columnWidths: { score: 220 } })

    expect(wrapper.find('thead th[data-column-key="score"]').attributes('style')).toContain('220px')

    wrapper.unmount()
  })

  it('во время загрузки ширина не меняется', async () => {
    const wrapper = mountTable({ resizableColumns: true, loading: true })
    layout(wrapper)

    dragResizer(wrapper, 0, 100, 200)
    await resizers(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('columnResize')).toBeUndefined()

    wrapper.unmount()
  })
})

describe('закреплённые колонки', () => {
  const pinnedColumns = [
    { key: 'name', label: 'Name', pinned: 'left' as const },
    { key: 'score', label: 'Score' },
    { key: 'note', label: 'Note', pinned: 'right' as const },
  ]

  it('встают группами у краёв, что бы ни говорил порядок', () => {
    const wrapper = mountTable({
      columns: pinnedColumns,
      columnOrder: ['note', 'score', 'name'],
    })

    expect(headerKeys(wrapper)).toEqual(['name', 'score', 'note'])

    wrapper.unmount()
  })

  it('липнут к своему краю со смещением по измеренным соседям', async () => {
    const wrapper = mountTable({
      columns: [
        { key: 'name', label: 'Name', pinned: 'left' as const },
        { key: 'score', label: 'Score', pinned: 'left' as const },
        { key: 'note', label: 'Note' },
      ],
    })
    layout(wrapper)
    // Пересчёт смещений идёт по изменению данных: в jsdom нет ни раскладки,
    // ни `ResizeObserver`, который ловит её в браузере.
    await wrapper.setProps({ rows: [...rows, { id: 3, name: 'Bob', score: 15, note: 'b' }] })
    // Два тика: первый пересчитывает смещения, второй доносит их до разметки.
    await nextTick()
    await nextTick()

    const style = (key: string) => wrapper.find(`thead th[data-column-key="${key}"]`).attributes('style') ?? ''

    expect(style('name')).toContain('left: 0px')
    expect(style('score')).toContain('left: 100px')

    wrapper.unmount()
  })

  it('колонка выбора закрепляется вместе с левой группой', () => {
    const wrapper = mountTable({ columns: pinnedColumns, selectable: true })
    const selectHeader = wrapper.findAll('thead th')[0]

    expect(selectHeader.attributes('style')).toContain('left: 0px')
    expect(selectHeader.classes()).toContain('sticky')

    wrapper.unmount()
  })

  it('перенос через границу закрепления не проходит', async () => {
    const wrapper = mountTable({ columns: pinnedColumns, reorderableColumns: true })

    // `name` закреплён слева, справа от него — обычная колонка: двигать некуда.
    await handles(wrapper)[0].trigger('keydown', { key: 'ArrowRight', shiftKey: true })

    expect(headerKeys(wrapper)).toEqual(['name', 'score', 'note'])
    expect(wrapper.emitted('columnReorder')).toBeUndefined()

    wrapper.unmount()
  })

  it('внутри группы перенос работает', async () => {
    const wrapper = mountTable({
      columns: [
        { key: 'name', label: 'Name', pinned: 'left' as const },
        { key: 'score', label: 'Score', pinned: 'left' as const },
        { key: 'note', label: 'Note' },
      ],
      reorderableColumns: true,
    })

    await handles(wrapper)[0].trigger('keydown', { key: 'ArrowRight', shiftKey: true })

    expect(headerKeys(wrapper)).toEqual(['score', 'name', 'note'])

    wrapper.unmount()
  })

  it('без закрепления липкости нет', () => {
    const wrapper = mountTable()

    expect(wrapper.find('thead th[data-column-key="name"]').classes()).not.toContain('sticky')

    wrapper.unmount()
  })
})

/**
 * Панели меню уезжают в общий портал, и в документе их столько же, сколько
 * колонок: открытую находим по `aria-controls` её триггера.
 */
function openColumnMenu(wrapper: ReturnType<typeof mountTable>, key: string) {
  const trigger = wrapper.get(`thead th[data-column-key="${key}"] [data-gr-datatable-column-menu-trigger]`)

  return async (): Promise<HTMLElement[]> => {
    await trigger.trigger('click')
    await nextTick()
    await nextTick()

    const panelId = trigger.attributes('aria-controls')
    if (!panelId)
      throw new Error('у триггера меню нет `aria-controls` — панель не открылась')

    const panel = document.getElementById(panelId)
    return [...(panel?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])]
  }
}

describe('GrDataTable — закрепление колонки пользователем', () => {
  it('без пропа меню в шапке нет: закрепление остаётся объявлением в конфиге', () => {
    const wrapper = mountTable()

    expect(wrapper.find('[data-gr-datatable-column-menu-trigger]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('меню есть у каждой колонки и названо ею', () => {
    const wrapper = mountTable({ pinnableColumns: true })

    const triggers = wrapper.findAll('[data-gr-datatable-column-menu-trigger]')
    expect(triggers).toHaveLength(columns.length)
    expect(triggers[0].attributes('aria-label')).toBe('Options for column Name')

    wrapper.unmount()
  })

  /**
   * Три состояния закрепления — выбор одного из трёх, а не три команды.
   * `menuitemradio` с `checked` объявляет текущее положение сам; списком
   * команд диктор назвал бы только их подписи, и «где колонка сейчас» пришлось
   * бы угадывать.
   */
  it('пункты — переключатели с объявленным текущим положением', async () => {
    const wrapper = mountTable({ pinnableColumns: true })
    const items = await openColumnMenu(wrapper, 'name')()
    expect(items).toHaveLength(3)
    expect(items.map(item => item.textContent?.trim())).toEqual([
      'Pin to the left',
      'Pin to the right',
      'Unpin',
    ])
    // Колонка не закреплена — отмечен третий пункт.
    expect(items.map(item => item.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true'])

    wrapper.unmount()
  })

  it('выбор закрепляет колонку, эмитит модель и объявляет результат', async () => {
    const wrapper = mountTable({ pinnableColumns: true })
    const items = await openColumnMenu(wrapper, 'score')()

    items[0].click()
    await nextTick()

    expect(wrapper.emitted('update:pinnedColumns')?.at(-1)).toEqual([{ score: 'left' }])
    expect(wrapper.emitted('columnPin')?.at(-1)).toEqual([{ key: 'score', pinned: 'left' }])
    expect(await announced()).toBe('Column Score pinned to the left')

    // Закреплённая колонка уходит своей группой к краю — иначе «слева» не
    // означало бы «слева».
    expect(headerKeys(wrapper)).toEqual(['score', 'name', 'note'])
    expect(wrapper.find('thead th[data-column-key="score"]').classes()).toContain('sticky')

    wrapper.unmount()
  })

  /**
   * `null` в модели — не «как в конфиге», а «откреплена». Без различия снять
   * закрепление, объявленное у колонки, было бы нечем.
   */
  it('открепление снимает и то, что объявлено в конфиге колонки', async () => {
    const wrapper = mountTable({
      pinnableColumns: true,
      columns: [
        { key: 'name', label: 'Name', pinned: 'left' },
        { key: 'score', label: 'Score' },
        { key: 'note', label: 'Note' },
      ],
    })

    expect(wrapper.find('thead th[data-column-key="name"]').classes()).toContain('sticky')

    const items = await openColumnMenu(wrapper, 'name')()
    // Отмечен первый пункт: колонка закреплена слева конфигом.
    expect(items.map(item => item.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false'])

    items[2].click()
    await nextTick()

    expect(wrapper.emitted('update:pinnedColumns')?.at(-1)).toEqual([{ name: null }])
    expect(wrapper.find('thead th[data-column-key="name"]').classes()).not.toContain('sticky')

    wrapper.unmount()
  })

  it('контролируемая модель не подменяется внутренней', async () => {
    const wrapper = mountTable({ pinnableColumns: true, pinnedColumns: { note: 'right' } })

    expect(headerKeys(wrapper)).toEqual(['name', 'score', 'note'])
    expect(wrapper.find('thead th[data-column-key="note"]').classes()).toContain('sticky')

    const items = await openColumnMenu(wrapper, 'name')()
    items[0].click()
    await nextTick()

    // Проп не менялся — раскладка тоже: решение за потребителем.
    expect(wrapper.emitted('update:pinnedColumns')?.at(-1)).toEqual([{ note: 'right', name: 'left' }])
    expect(headerKeys(wrapper)).toEqual(['name', 'score', 'note'])

    wrapper.unmount()
  })

  it('повторный выбор того же положения ничего не эмитит', async () => {
    const wrapper = mountTable({ pinnableColumns: true })
    const items = await openColumnMenu(wrapper, 'name')()

    items[2].click()
    await nextTick()

    expect(wrapper.emitted('update:pinnedColumns')).toBeUndefined()

    wrapper.unmount()
  })
})
