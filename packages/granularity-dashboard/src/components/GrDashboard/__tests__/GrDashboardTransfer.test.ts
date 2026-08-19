import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { cancelPointer, granularityGlobal, move, press, release, resetGranularityDom } from '@feugene/granularity/testing'

import type { GrDashboardResponsiveLayout } from '../../../layout'
import { addItem } from '../../../layout'
import type { GrDashboardPaletteItem } from '../../GrDashboardPalette/grDashboardPaletteStyles'
import type { GrDashboardDropEvent } from '../context'
import GrDashboard from '../GrDashboard.vue'
import GrDashboardItem from '../../GrDashboardItem/GrDashboardItem.vue'
import GrDashboardPalette from '../../GrDashboardPalette/GrDashboardPalette.vue'

/**
 * Приём виджета из каталога.
 *
 * 1200px на 12 колонок при зазоре 12 дают колонку 89px и шаг 101px; строка при
 * `rowHeight: 64` — шаг 76px. Точка считается **центром** несомого виджета,
 * поэтому в ожиданиях к левому краю целевой ячейки прибавляется половина его
 * ширины.
 */
const COL_STEP = 101
const HALF_2x2 = { x: (2 * 89 + 12) / 2, y: (2 * 64 + 12) / 2 }

let restoreRect: (() => void) | null = null

beforeEach(() => {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'getBoundingClientRect')

  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: (): DOMRect => new DOMRect(0, 0, 1200, 600),
  })

  restoreRect = () => {
    if (original) Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', original)
  }
})

afterEach(() => {
  cancelPointer()
  restoreRect?.()
  restoreRect = null
  resetGranularityDom()
})

const CATALOGUE: GrDashboardPaletteItem[] = [{ id: 'fresh', title: 'Новый', defaultSize: { w: 2, h: 2 } }]

interface StandOptions {
  mode?: 'view' | 'edit'
  droppable?: boolean
  empty?: boolean
}

function stand(options: StandOptions = {}) {
  const layout = ref<GrDashboardResponsiveLayout>({
    lg: options.empty ? [] : [{ id: 'sales', x: 0, y: 0, w: 4, h: 2 }],
  })
  const drops: GrDashboardDropEvent[] = []
  const commits: GrDashboardResponsiveLayout[] = []

  const Stand = defineComponent({
    setup: () => () => h('div', [
      h(GrDashboardPalette, { items: CATALOGUE }),
      h(
        GrDashboard,
        {
          'layout': layout.value,
          'mode': options.mode ?? 'edit',
          'droppable': options.droppable,
          'onUpdate:layout': (value: GrDashboardResponsiveLayout) => {
            commits.push(value)
            layout.value = value
          },
          'onItemDrop': (event: GrDashboardDropEvent) => drops.push(event),
        },
        () => (layout.value.lg ?? []).map(item => h(
          GrDashboardItem,
          { key: item.id, itemId: item.id, title: item.id },
          { default: () => 'график' },
        )),
      ),
    ]),
  })

  const wrapper = mount(Stand, { attachTo: document.body, global: granularityGlobal() })
  const root = wrapper.element as HTMLElement

  return { root, layout, drops, commits }
}

function tile(root: HTMLElement): HTMLElement {
  const el = root.querySelector<HTMLElement>('[data-gr-dashboard-palette-item] > *')
  if (!el) throw new Error('нет плитки каталога')

  return el
}

const placeholder = (root: HTMLElement) => root.querySelector<HTMLElement>('[data-gr-dashboard-placeholder]')

async function frame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

/** Довести указатель до центра ячейки `(col, row)` для виджета 2×2. */
async function carryTo(root: HTMLElement, col: number, row: number): Promise<void> {
  press(tile(root), { clientX: 5, clientY: 5 })
  move({ clientX: col * COL_STEP + HALF_2x2.x, clientY: row * 76 + HALF_2x2.y })
  await frame()
  await nextTick()
}

describe('gRDashboard: приём виджета из каталога', () => {
  it('подложка встаёт в расчётную ячейку, а раскладка не трогается', async () => {
    const { root, commits } = stand()

    await carryTo(root, 6, 0)

    const cell = placeholder(root)
    expect(cell).not.toBeNull()
    expect(cell?.style.gridColumn).toBe('7 / span 2')
    expect(cell?.style.gridRow).toBe('1 / span 2')

    // Фантом наружу не выходит: ни лишнего виджета в разметке, ни коммита.
    expect(root.querySelectorAll('[data-gr-dashboard-item]')).toHaveLength(1)
    expect(commits).toHaveLength(0)
  })

  it('отпускание шлёт itemDrop с ячейкой, брейкпоинтом и опциями сетки', async () => {
    const { root, drops, commits } = stand()

    await carryTo(root, 6, 0)
    release()
    await nextTick()

    expect(drops).toHaveLength(1)
    expect(drops[0]?.cell).toEqual({ x: 6, y: 0 })
    expect(drops[0]?.breakpoint).toBe('lg')
    expect(drops[0]?.options.cols).toBe(12)
    expect(drops[0]?.transfer.id).toBe('fresh')
    // Раскладку кладёт приложение — сетка сама в неё не пишет.
    expect(commits).toHaveLength(0)
    expect(placeholder(root)).toBeNull()
  })

  it('приложение, повторившее addItem с опциями события, получает то же место', async () => {
    const { root, layout, drops } = stand()

    await carryTo(root, 6, 0)
    const shown = placeholder(root)?.style.gridColumn
    release()
    await nextTick()

    const event = drops[0]!
    const next = addItem(
      layout.value.lg ?? [],
      { id: event.transfer.id, x: 0, y: 0, w: event.transfer.size.w, h: event.transfer.size.h },
      event.options,
      event.cell,
    )
    const placed = next.find(item => item.id === 'fresh')!

    expect(`${placed.x + 1} / span ${placed.w}`).toBe(shown)
  })

  it('уход указателя с сетки убирает подложку, а бросок мимо не шлёт ничего', async () => {
    const { root, drops } = stand()

    await carryTo(root, 6, 0)
    expect(placeholder(root)).not.toBeNull()

    move({ clientX: 5000, clientY: 5000 })
    await frame()
    await nextTick()
    expect(placeholder(root)).toBeNull()

    release()
    await nextTick()
    expect(drops).toHaveLength(0)
  })

  it('Esc отменяет бросок', async () => {
    const { root, drops } = stand()

    await carryTo(root, 6, 0)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()

    expect(placeholder(root)).toBeNull()
    expect(drops).toHaveLength(0)
  })

  it('обрыв указателя отменяет бросок', async () => {
    const { root, drops } = stand()

    await carryTo(root, 6, 0)
    cancelPointer()
    await nextTick()

    expect(placeholder(root)).toBeNull()
    expect(drops).toHaveLength(0)
  })

  it('режим просмотра бросок не принимает', async () => {
    const { root, drops } = stand({ mode: 'view' })

    await carryTo(root, 6, 0)
    release()
    await nextTick()

    expect(placeholder(root)).toBeNull()
    expect(drops).toHaveLength(0)
  })

  it('droppable=false бросок не принимает', async () => {
    const { root, drops } = stand({ droppable: false })

    await carryTo(root, 6, 0)
    release()
    await nextTick()

    expect(placeholder(root)).toBeNull()
    expect(drops).toHaveLength(0)
  })

  it('на пустой сетке текст пустого состояния уступает место подложке', async () => {
    const { root } = stand({ empty: true })
    const emptyText = () => root.textContent?.includes('No widgets yet')

    expect(emptyText()).toBe(true)

    await carryTo(root, 0, 0)
    expect(placeholder(root)).not.toBeNull()
    expect(emptyText()).toBe(false)

    cancelPointer()
    await nextTick()
    expect(emptyText()).toBe(true)
  })

  it('перенос из каталога и жест ручки взаимно исключаются', async () => {
    const { root, drops, commits } = stand()
    const handle = root.querySelector<HTMLElement>('[data-gr-dashboard-drag-handle]')!

    await carryTo(root, 6, 0)

    // Нажатие на ручку посреди чужого переноса не начинает второй жест.
    press(handle, { clientX: 0, clientY: 0 })
    move({ clientX: 400, clientY: 0 })
    await frame()
    await nextTick()

    release()
    await nextTick()

    expect(drops).toHaveLength(1)
    expect(commits).toHaveLength(0)
  })
})
