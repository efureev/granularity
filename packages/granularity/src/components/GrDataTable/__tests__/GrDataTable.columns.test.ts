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

type Row = { id: number, name: string, score: number, note: string }

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'score', label: 'Score', sortable: true, align: 'right' as const },
  { key: 'note', label: 'Note' },
]

const rows: Row[] = [
  { id: 1, name: 'Charlie', score: 20, note: 'c' },
  { id: 2, name: 'Alice', score: 10, note: 'a' },
]

function mountTable(props: Record<string, unknown> = {}) {
  return mount(GrDataTable, {
    props: { columns, rows, reorderableColumns: true, ...props },
    attachTo: document.body,
  })
}

/** Порядок читается по ключам, а не по тексту: в подписи живёт ещё и sr-only подсказка сортировки. */
function headerKeys(wrapper: ReturnType<typeof mountTable>): string[] {
  return wrapper.findAll('thead th').map(th => th.attributes('data-column-key') ?? '')
}

function handles(wrapper: ReturnType<typeof mountTable>) {
  return wrapper.findAll('[data-gr-datatable-column-handle]')
}

/** jsdom не знает `PointerEvent`; ширины колонок задаём руками. */
function pointer(type: string, init: MouseEventInit = {}): MouseEvent {
  return new MouseEvent(type, { bubbles: true, ...init })
}

/** Колонки по 100px подряд. */
function layout(wrapper: ReturnType<typeof mountTable>): void {
  wrapper.findAll('thead th').forEach((th, index) => {
    ;(th.element as HTMLElement).getBoundingClientRect = () => ({
      top: 0,
      bottom: 40,
      left: index * 100,
      right: index * 100 + 100,
      width: 100,
      height: 40,
      x: index * 100,
      y: 0,
      toJSON: () => ({}),
    })
  })
}

function dragColumn(wrapper: ReturnType<typeof mountTable>, from: number, toX: number): void {
  handles(wrapper)[from].element.dispatchEvent(pointer('pointerdown', { clientX: from * 100 + 10, button: 0 }))
  window.dispatchEvent(pointer('pointermove', { clientX: toX }))
  window.dispatchEvent(pointer('pointerup'))
}

async function announced(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 2))
  return document.querySelector('[data-gr-announcer-region="polite"]')?.textContent ?? ''
}

afterEach(() => {
  resetAnnouncer()
})

describe('ручка перестановки', () => {
  it('без `reorderableColumns` ручек нет', () => {
    const wrapper = mountTable({ reorderableColumns: false })

    expect(handles(wrapper)).toHaveLength(0)

    wrapper.unmount()
  })

  it('ручка у каждой колонки, но остановка `Tab` одна на шапку', () => {
    const wrapper = mountTable()
    const tabindexes = handles(wrapper).map(handle => handle.attributes('tabindex'))

    expect(handles(wrapper)).toHaveLength(3)
    expect(tabindexes.filter(value => value === '0')).toHaveLength(1)
    expect(tabindexes.filter(value => value === '-1')).toHaveLength(2)

    wrapper.unmount()
  })

  it('во время загрузки перенос выключен', () => {
    const wrapper = mountTable({ loading: true })

    expect(handles(wrapper)[0].attributes('disabled')).toBeDefined()

    wrapper.unmount()
  })
})

describe('перенос указателем', () => {
  it('меняет порядок в шапке и в теле', async () => {
    const wrapper = mountTable()
    layout(wrapper)

    // Первую колонку — в правую половину третьей.
    dragColumn(wrapper, 0, 280)
    await nextTick()

    expect(headerKeys(wrapper)).toEqual(['score', 'note', 'name'])
    expect(wrapper.findAll('tbody tr')[0].text()).toBe('20cCharlie')

    wrapper.unmount()
  })

  it('отдаёт новый порядок и событие переноса', async () => {
    const wrapper = mountTable()
    layout(wrapper)

    dragColumn(wrapper, 2, 20)
    await nextTick()

    expect(wrapper.emitted('update:columnOrder')?.[0][0]).toEqual(['note', 'name', 'score'])
    expect(wrapper.emitted('columnReorder')?.[0][0]).toEqual({ key: 'note', from: 2, to: 0 })

    wrapper.unmount()
  })

  it('клик по ручке без движения порядок не меняет', async () => {
    const wrapper = mountTable()
    layout(wrapper)

    handles(wrapper)[0].element.dispatchEvent(pointer('pointerdown', { clientX: 10, button: 0 }))
    window.dispatchEvent(pointer('pointerup'))
    await nextTick()

    expect(wrapper.emitted('columnReorder')).toBeUndefined()

    wrapper.unmount()
  })

  it('сортировка по клику на заголовок продолжает работать', async () => {
    const wrapper = mountTable()

    await wrapper.findAll('[data-gr-datatable-sort]')[0].trigger('click')

    expect(wrapper.emitted('sortChange')?.[0]).toEqual([{ key: 'name', dir: 'asc' }])
    expect(wrapper.emitted('columnReorder')).toBeUndefined()

    wrapper.unmount()
  })
})

describe('клавиатура', () => {
  it('`Shift` со стрелкой двигает колонку', async () => {
    const wrapper = mountTable()

    await handles(wrapper)[0].trigger('keydown', { key: 'ArrowRight', shiftKey: true })
    await nextTick()

    expect(headerKeys(wrapper)).toEqual(['score', 'name', 'note'])
    expect(wrapper.emitted('columnReorder')?.[0][0]).toEqual({ key: 'name', from: 0, to: 1 })

    wrapper.unmount()
  })

  it('на краю набора колонка не уезжает', async () => {
    const wrapper = mountTable()

    await handles(wrapper)[0].trigger('keydown', { key: 'ArrowLeft', shiftKey: true })

    expect(headerKeys(wrapper)).toEqual(['name', 'score', 'note'])
    expect(wrapper.emitted('columnReorder')).toBeUndefined()

    wrapper.unmount()
  })

  it('голая стрелка ведёт фокус между ручками, а не колонку', async () => {
    const wrapper = mountTable()

    await handles(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('columnReorder')).toBeUndefined()
    expect(handles(wrapper)[1].attributes('tabindex')).toBe('0')

    wrapper.unmount()
  })

  it('перестановка объявляется в живой регион', async () => {
    const wrapper = mountTable()

    await handles(wrapper)[0].trigger('keydown', { key: 'ArrowRight', shiftKey: true })

    expect(await announced()).toBe('Column Name moved to position 2 of 3')

    wrapper.unmount()
  })
})

describe('контролируемый порядок', () => {
  it('`columnOrder` задаёт порядок колонок', () => {
    const wrapper = mountTable({ columnOrder: ['note', 'name', 'score'] })

    expect(headerKeys(wrapper)).toEqual(['note', 'name', 'score'])

    wrapper.unmount()
  })

  it('без обновления пропа порядок не меняется, но событие приходит', async () => {
    const wrapper = mountTable({ columnOrder: ['name', 'score', 'note'] })

    await handles(wrapper)[0].trigger('keydown', { key: 'ArrowRight', shiftKey: true })
    await nextTick()

    expect(headerKeys(wrapper)).toEqual(['name', 'score', 'note'])
    expect(wrapper.emitted('update:columnOrder')?.[0][0]).toEqual(['score', 'name', 'note'])

    wrapper.unmount()
  })

  it('ключ, которого нет в наборе, игнорируется; колонка вне порядка встаёт в конец', () => {
    const wrapper = mountTable({ columnOrder: ['note', 'ghost'] })

    // Состав задаёт `columns`: `ghost` отброшен, `name` и `score` дописаны.
    expect(headerKeys(wrapper)).toEqual(['note', 'name', 'score'])

    wrapper.unmount()
  })
})
