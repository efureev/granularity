import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { announced, granularityGlobal, keydown, resetGranularityDom } from '@feugene/granularity/testing'

import type { GrDashboardResponsiveLayout } from '../../../layout'
import GrDashboard from '../GrDashboard.vue'
import GrDashboardItem from '../../GrDashboardItem/GrDashboardItem.vue'

afterEach(resetGranularityDom)

function initialLayout(): GrDashboardResponsiveLayout {
  return {
    lg: [
      { id: 'sales', x: 0, y: 0, w: 4, h: 2 },
      { id: 'traffic', x: 4, y: 0, w: 4, h: 2 },
    ],
  }
}

/**
 * Ширины в jsdom нет, а от неё зависит выбор брейкпоинта. Подменяется именно
 * прототип: замерить контейнер компонент успевает в `onMounted`, то есть до
 * того, как тест доберётся до его элемента.
 */
function stubWidth(width: number): () => void {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'getBoundingClientRect')

  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: (): DOMRect => new DOMRect(0, 0, width, 0),
  })

  return () => {
    if (original) Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', original)
  }
}

/**
 * Стенд собран отдельным компонентом, а не `slots` в `mount`: раскладка ходит
 * через `v-model:layout`, и проверять надо именно её обратный путь.
 */
function stand(options: { mode?: 'view' | 'edit', layout?: GrDashboardResponsiveLayout } = {}) {
  const layout = ref(options.layout ?? initialLayout())

  const Stand = defineComponent({
    setup: () => () => h(
      GrDashboard,
      {
        'layout': layout.value,
        'mode': options.mode ?? 'view',
        'onUpdate:layout': (value: GrDashboardResponsiveLayout) => { layout.value = value },
      },
      () => [
        h(GrDashboardItem, { itemId: 'sales', title: 'Продажи' }, { default: () => 'график' }),
        h(GrDashboardItem, { itemId: 'traffic', title: 'Трафик' }, { default: () => 'график' }),
      ],
    ),
  })

  const restore = stubWidth(1200)
  const wrapper = mount(Stand, { attachTo: document.body, global: granularityGlobal() })
  restore()

  return { root: wrapper.element as HTMLElement, layout }
}

function query(root: HTMLElement, selector: string): HTMLElement {
  const el = root.querySelector<HTMLElement>(selector)
  if (!el) throw new Error(`не найдено: ${selector}`)

  return el
}

function dragHandle(root: HTMLElement, id: string): HTMLElement {
  return query(root, `[data-item-id="${id}"] [data-gr-dashboard-drag-handle]`)
}

function resizeHandle(root: HTMLElement, id: string): HTMLElement {
  return query(root, `[data-item-id="${id}"] [data-gr-dashboard-resize-handle]`)
}

describe('gRDashboard: раскладка и роли', () => {
  it('каждый виджет встаёт в свою область сетки', () => {
    const { root } = stand()
    const sales = query(root, '[data-item-id="sales"]')

    expect(sales.style.gridColumn).toBe('1 / span 4')
    expect(sales.style.gridRow).toBe('1 / span 2')
  })

  it('контейнер и виджеты объявлены группами с именами', () => {
    const { root } = stand()
    expect(root.getAttribute('role')).toBe('group')
    expect(root.getAttribute('aria-label')).toBeTruthy()

    const sales = query(root, '[data-item-id="sales"]')
    expect(sales.getAttribute('role')).toBe('group')
    expect(sales.getAttribute('aria-labelledby')).toBeTruthy()
  })

  it('в режиме просмотра ручек нет вовсе — не скрыты, а не отрисованы', () => {
    const { root } = stand()

    expect(root.querySelector('[data-gr-dashboard-drag-handle]')).toBeNull()
    expect(root.querySelector('[data-gr-dashboard-resize-handle]')).toBeNull()
  })

  it('в режиме редактирования ручка переноса — кнопка с именем виджета', () => {
    const { root } = stand({ mode: 'edit' })
    const handle = dragHandle(root, 'sales')

    expect(handle.tagName).toBe('BUTTON')
    expect(handle.getAttribute('aria-label')).toContain('Продажи')
  })

  it('сетка — одна остановка Tab: только у одной ручки tabindex 0', () => {
    const { root } = stand({ mode: 'edit' })
    const tabindexes = [...root.querySelectorAll('[data-gr-dashboard-drag-handle]')]
      .map(el => el.getAttribute('tabindex'))

    expect(tabindexes.filter(value => value === '0')).toHaveLength(1)
  })
})

describe('gRDashboard: клавиатурный перенос', () => {
  it('Space берёт виджет, стрелка двигает, Space кладёт', async () => {
    const { root, layout } = stand({ mode: 'edit' })
    const handle = dragHandle(root, 'sales')

    keydown(handle, ' ')
    await nextTick()
    expect(handle.getAttribute('aria-pressed')).toBe('true')

    keydown(handle, 'ArrowRight')
    await nextTick()
    expect(layout.value.lg?.find(item => item.id === 'sales')?.x).toBe(1)

    keydown(handle, ' ')
    await nextTick()
    expect(handle.getAttribute('aria-pressed')).toBe('false')
  })

  it('вниз по пустому месту виджет не уезжает: компактизация тянет его обратно', async () => {
    const { root, layout } = stand({ mode: 'edit' })
    const handle = dragHandle(root, 'sales')

    keydown(handle, ' ')
    keydown(handle, 'ArrowDown')
    await nextTick()

    expect(layout.value.lg?.find(item => item.id === 'sales')?.y).toBe(0)
  })

  it('Esc возвращает виджет на исходное место', async () => {
    const { root, layout } = stand({ mode: 'edit' })
    const handle = dragHandle(root, 'sales')

    keydown(handle, ' ')
    keydown(handle, 'ArrowRight')
    await nextTick()
    expect(layout.value.lg?.find(item => item.id === 'sales')?.x).toBe(1)

    keydown(handle, 'Escape')
    await nextTick()
    expect(layout.value.lg?.find(item => item.id === 'sales')?.x).toBe(0)
  })

  it('стрелки без взятия водят фокус, а не двигают виджет', async () => {
    const { root, layout } = stand({ mode: 'edit' })
    const before = JSON.stringify(layout.value)

    keydown(dragHandle(root, 'sales'), 'ArrowRight')
    await nextTick()

    expect(JSON.stringify(layout.value)).toBe(before)
  })

  it('перенос объявляется в живом регионе', async () => {
    const { root } = stand({ mode: 'edit' })
    const handle = dragHandle(root, 'sales')

    keydown(handle, ' ')
    expect(await announced()).toContain('Продажи')

    keydown(handle, 'ArrowDown')
    expect(await announced()).toBeTruthy()
  })
})

describe('gRDashboard: растягивание с клавиатуры', () => {
  it('стрелка вправо добавляет колонку, вниз — строку', async () => {
    const { root, layout } = stand({ mode: 'edit' })
    const handle = resizeHandle(root, 'sales')

    keydown(handle, 'ArrowRight')
    await nextTick()
    expect(layout.value.lg?.find(item => item.id === 'sales')?.w).toBe(5)

    keydown(handle, 'ArrowDown')
    await nextTick()
    expect(layout.value.lg?.find(item => item.id === 'sales')?.h).toBe(3)
  })

  it('Shift даёт крупный шаг', async () => {
    const { root, layout } = stand({ mode: 'edit' })
    const handle = resizeHandle(root, 'sales')

    keydown(handle, 'ArrowRight', { shiftKey: true })
    await nextTick()

    expect(layout.value.lg?.find(item => item.id === 'sales')?.w).toBe(7)
  })

  it('ручка размера несёт текущий размер в собственном имени', () => {
    const { root } = stand({ mode: 'edit' })
    const label = resizeHandle(root, 'sales').getAttribute('aria-label') ?? ''

    expect(label).toContain('Продажи')
    expect(label).toContain('4')
    expect(label).toContain('2')
  })
})

describe('gRDashboard: пустое состояние', () => {
  it('содержимое слота занимает всю ширину сетки, а не одну колонку', async () => {
    // Слот — обычный ребёнок CSS Grid: без обёртки со `col-span-full` текст
    // приложения встал бы в колонку из двенадцати и порвался по буквам.
    const layout = ref<GrDashboardResponsiveLayout>({ lg: [] })

    const Stand = defineComponent({
      setup: () => () => h(
        GrDashboard,
        { layout: layout.value },
        { empty: () => h('p', 'Дашборд пуст') },
      ),
    })

    const wrapper = mount(Stand, { attachTo: document.body, global: granularityGlobal() })
    await nextTick()

    const slotHost = (wrapper.element as HTMLElement).querySelector('p')?.parentElement

    expect(slotHost?.className).toContain('col-span-full')
  })
})

describe('gRDashboard: прокручиваемое тело виджета', () => {
  /** Переполнение задаётся до монтирования: замер идёт в `onMounted`. */
  function stubOverflow(scrollHeight: number, clientHeight: number): () => void {
    const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
    const client = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')

    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value: scrollHeight })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: clientHeight })

    return () => {
      if (scroll) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', scroll)
      if (client) Object.defineProperty(HTMLElement.prototype, 'clientHeight', client)
    }
  }

  function bodyOf(root: HTMLElement): HTMLElement {
    return query(root, '[data-item-id="sales"] [data-gr-card-body] > div')
  }

  it('переполненное тело встаёт в таб-порядок', async () => {
    // Прокручиваемая область, которую нельзя сфокусировать, недостижима с
    // клавиатуры — axe ловит это правилом `scrollable-region-focusable`.
    const restore = stubOverflow(400, 200)
    const { root } = stand()
    restore()
    await nextTick()

    expect(bodyOf(root).getAttribute('tabindex')).toBe('0')
  })

  it('умещающееся тело лишней остановки Tab не создаёт', async () => {
    // Постоянный `tabindex` дал бы тридцать лишних остановок на дашборде из
    // тридцати виджетов — поэтому он ставится по факту переполнения.
    const restore = stubOverflow(200, 200)
    const { root } = stand()
    restore()
    await nextTick()

    expect(bodyOf(root).getAttribute('tabindex')).toBeNull()
  })
})

describe('gRDashboard: что уходит наружу', () => {
  it('в раскладку не подмешивается ничего из разметки виджета', async () => {
    // `title` и границы объявлены пропами `GrDashboardItem`. Попади они в
    // модель — уехали бы в хранилище, где `title` протухнет при первой смене
    // языка, а границы стали бы второй правдой рядом с шаблоном.
    const { root, layout } = stand({ mode: 'edit' })

    keydown(dragHandle(root, 'sales'), ' ')
    keydown(dragHandle(root, 'sales'), 'ArrowRight')
    await nextTick()

    const moved = layout.value.lg?.find(item => item.id === 'sales')

    expect(moved).toEqual({ id: 'sales', x: 1, y: 0, w: 4, h: 2 })
  })
})

describe('gRDashboard: границы виджета', () => {
  it('объявленный виджетом minW не даёт сжать его сильнее', async () => {
    const layout = ref<GrDashboardResponsiveLayout>({ lg: [{ id: 'sales', x: 0, y: 0, w: 4, h: 2 }] })

    const Stand = defineComponent({
      setup: () => () => h(
        GrDashboard,
        {
          'layout': layout.value,
          'mode': 'edit',
          'onUpdate:layout': (value: GrDashboardResponsiveLayout) => { layout.value = value },
        },
        () => [h(GrDashboardItem, { itemId: 'sales', title: 'Продажи', minW: 3 })],
      ),
    })

    const restore = stubWidth(1200)
    const wrapper = mount(Stand, { attachTo: document.body, global: granularityGlobal() })
    restore()
    const handle = resizeHandle(wrapper.element as HTMLElement, 'sales')

    keydown(handle, 'ArrowLeft')
    keydown(handle, 'ArrowLeft')
    await nextTick()

    expect(layout.value.lg?.[0]?.w).toBe(3)
  })
})
