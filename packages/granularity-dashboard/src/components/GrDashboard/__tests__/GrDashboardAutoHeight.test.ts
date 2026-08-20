import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { resetGranularityDom } from '@feugene/granularity/testing'
import { nextFrame } from '@feugene/granularity-test-kit/vue'

import type { GrDashboardItemLayout, GrDashboardResponsiveLayout } from '../../../layout'
import GrDashboard from '../GrDashboard.vue'
import GrDashboardItem from '../../GrDashboardItem/GrDashboardItem.vue'

/**
 * Авто-высота — единственное место пакета, где раскладку меняет не человек, а
 * содержимое. Отсюда предмет проверок: не «виджет вырос», а что он **ужимается
 * обратно**, что упор в `maxH` и `static` его не пускают, и что приложение
 * отличает такое обновление от пользовательской правки.
 *
 * Ширина строки — 60px, зазор — 10px, шаг — 70px. Виджет в `h` строк занимает
 * `h * 60 + (h - 1) * 10`: одна — 60, две — 130, три — 200.
 */
const ROW_HEIGHT = 60
const GAP = 10
const WIDTH = 1200

/** Высота, назначенная элементу тестом. Читается подменённым `getBoundingClientRect`. */
const heights = new Map<Element, number>()

/** Вертикальные отступы элемента: их не видно ни в обёртке, ни в разности. */
const paddings = new Map<Element, number>()

/**
 * Наблюдатель-двойник вместо пустышки из `setup.ts`.
 *
 * Пустышка годится там, где компонент обязан пережить отсутствие наблюдателя,
 * но проверить ужатие ею нельзя: замер после первого не случится никогда, а
 * ровно он и отличает настоящий замер содержимого от чтения `scrollHeight`.
 */
const observers = new Set<{ cb: ResizeObserverCallback, els: Set<Element> }>()

class FakeResizeObserver {
  private entry = { cb: null as unknown as ResizeObserverCallback, els: new Set<Element>() }

  constructor(cb: ResizeObserverCallback) {
    this.entry = { cb, els: new Set() }
    observers.add(this.entry)
  }

  observe(el: Element): void { this.entry.els.add(el) }
  unobserve(el: Element): void { this.entry.els.delete(el) }
  disconnect(): void { observers.delete(this.entry) }
  takeRecords(): [] { return [] }
}

/** Сообщает всем наблюдателям, что перечисленные элементы изменились. */
function fireResize(...targets: Element[]): void {
  for (const observer of observers) {
    const seen = targets.filter(target => observer.els.has(target))
    if (seen.length === 0) continue

    observer.cb(seen.map(target => ({ target })) as unknown as ResizeObserverEntry[], null as never)
  }
}

let restore: (() => void) | null = null

beforeEach(() => {
  const original = Object.getOwnPropertyDescriptor(Element.prototype, 'getBoundingClientRect')
  const previousObserver = globalThis.ResizeObserver

  Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
    configurable: true,
    value(this: Element): DOMRect {
      const height = heights.get(this) ?? 0
      return { x: 0, y: 0, top: 0, left: 0, right: WIDTH, bottom: height, width: WIDTH, height, toJSON: () => ({}) }
    },
  })
  globalThis.ResizeObserver = FakeResizeObserver

  const originalStyle = window.getComputedStyle.bind(window)
  window.getComputedStyle = ((el: Element, pseudo?: string | null) => {
    const own = paddings.get(el)
    if (own === undefined) return originalStyle(el, pseudo)

    return { paddingTop: `${own / 2}px`, paddingBottom: `${own / 2}px` } as CSSStyleDeclaration
  })

  restore = () => {
    window.getComputedStyle = originalStyle
    paddings.clear()
    if (original) Object.defineProperty(Element.prototype, 'getBoundingClientRect', original)
    globalThis.ResizeObserver = previousObserver
    heights.clear()
    observers.clear()
  }
})

afterEach(() => {
  restore?.()
  restore = null
  resetGranularityDom()
})

interface StandOptions {
  layout?: GrDashboardResponsiveLayout
  autoHeight?: boolean
  maxH?: number
  mode?: 'view' | 'edit'
}

function stand(options: StandOptions = {}) {
  const layout = ref<GrDashboardResponsiveLayout>(options.layout ?? {
    lg: [{ id: 'a', x: 0, y: 0, w: 4, h: 1 }],
  })
  const autoResized: [string, GrDashboardItemLayout, GrDashboardItemLayout][] = []
  const userResized: string[] = []
  let commits = 0

  const Stand = defineComponent({
    setup: () => () => h(
      GrDashboard,
      {
        'layout': layout.value,
        'rowHeight': ROW_HEIGHT,
        'gap': GAP,
        'mode': options.mode ?? 'view',
        'onUpdate:layout': (value: GrDashboardResponsiveLayout) => {
          commits += 1
          layout.value = value
        },
        'onItemAutoResize': (id: string, from: GrDashboardItemLayout, to: GrDashboardItemLayout) => {
          autoResized.push([id, from, to])
        },
        'onItemResize': (id: string) => { userResized.push(id) },
      },
      () => (layout.value.lg ?? []).map(item => h(
        GrDashboardItem,
        { key: item.id, itemId: item.id, autoHeight: options.autoHeight ?? true, maxH: options.maxH },
        () => h('p', 'содержимое'),
      )),
    ),
  })

  const wrapper = mount(Stand, { attachTo: document.body })

  return {
    wrapper,
    autoResized,
    userResized,
    commits: () => commits,
    itemAt: (id: string) => (layout.value.lg ?? []).find(entry => entry.id === id),
  }
}

/** Назначает виджету высоту содержимого и «обвес» карточки. */
function setContent(wrapper: ReturnType<typeof mount>, id: string, contentPx: number, chromePx = 0, paddingPx = 0): Element {
  const root = wrapper.find(`[data-item-id="${id}"]`).element
  const body = root.querySelector('[data-gr-dashboard-measure]')!.parentElement!
  const measure = root.querySelector('[data-gr-dashboard-measure]')!

  heights.set(measure, contentPx)
  heights.set(body, 100)
  heights.set(root, 100 + chromePx)
  paddings.set(body, paddingPx)

  return measure
}

describe('авто-высота', () => {
  it('виджет вырастает под содержимое', async () => {
    const s = stand()
    const measure = setContent(s.wrapper, 'a', 200)

    fireResize(measure)
    await nextFrame()
    await nextTick()

    // 200px содержимого → три строки (60 / 130 / 200).
    expect(s.itemAt('a')?.h).toBe(3)
  })

  /**
   * Тот самый случай, который не ловится через `scrollHeight`: став выше
   * содержимого, виджет сообщал бы собственную высоту и не ужимался бы никогда.
   */
  it('и ужимается обратно, когда содержимого стало меньше', async () => {
    const s = stand()
    const measure = setContent(s.wrapper, 'a', 200)

    fireResize(measure)
    await nextFrame()
    await nextTick()
    expect(s.itemAt('a')?.h).toBe(3)

    setContent(s.wrapper, 'a', 60)
    fireResize(measure)
    await nextFrame()
    await nextTick()

    expect(s.itemAt('a')?.h).toBe(1)
  })

  it('обвес виджета входит в высоту', async () => {
    const s = stand()
    // 130px содержимого — ровно две строки; плюс 40px шапки уже три.
    const measure = setContent(s.wrapper, 'a', 130, 40)

    fireResize(measure)
    await nextFrame()
    await nextTick()

    expect(s.itemAt('a')?.h).toBe(3)
  })

  /**
   * Отступы тела не видны ни в обёртке, ни в разности «корень минус тело»:
   * `getBoundingClientRect` у тела — это его border-box, а обёртка стоит уже
   * внутри отступов. Без поправки виджет просил на строку меньше и обрезал
   * собственное содержимое — ровно это и было видно на витрине.
   */
  it('отступы тела входят в высоту', async () => {
    const s = stand()
    // 120px содержимого — две строки; плюс 24px отступов уже три.
    const measure = setContent(s.wrapper, 'a', 120, 0, 24)

    fireResize(measure)
    await nextFrame()
    await nextTick()

    expect(s.itemAt('a')?.h).toBe(3)
  })

  it('`maxH` сильнее содержимого', async () => {
    const s = stand({ maxH: 2 })
    const measure = setContent(s.wrapper, 'a', 400)

    fireResize(measure)
    await nextFrame()
    await nextTick()

    expect(s.itemAt('a')?.h).toBe(2)
  })

  it('`static` авто-высоте не поддаётся', async () => {
    const s = stand({ layout: { lg: [{ id: 'a', x: 0, y: 0, w: 4, h: 1, static: true }] } })
    const measure = setContent(s.wrapper, 'a', 400)

    fireResize(measure)
    await nextFrame()
    await nextTick()

    expect(s.itemAt('a')?.h).toBe(1)
  })

  it('без пропа высота принадлежит раскладке', async () => {
    const s = stand({ autoHeight: false })

    expect(s.wrapper.find('[data-gr-dashboard-measure]').exists()).toBe(false)

    await nextFrame()
    await nextTick()

    expect(s.itemAt('a')?.h).toBe(1)
    expect(s.commits()).toBe(0)
  })

  it('работает в режиме просмотра, а не только в редактировании', async () => {
    const s = stand({ mode: 'view' })
    const measure = setContent(s.wrapper, 'a', 200)

    fireResize(measure)
    await nextFrame()
    await nextTick()

    expect(s.itemAt('a')?.h).toBe(3)
  })
})

describe('события авто-высоты', () => {
  it('приходит `itemAutoResize`, а не `itemResize`', async () => {
    const s = stand()
    const measure = setContent(s.wrapper, 'a', 200)

    fireResize(measure)
    await nextFrame()
    await nextTick()

    expect(s.autoResized.map(([id, from, to]) => [id, from.h, to.h])).toEqual([['a', 1, 3]])
    expect(s.userResized).toEqual([])
  })

  /** Иначе десять виджетов на дашборде дали бы десять записей в хранилище. */
  it('несколько виджетов в одном кадре дают одно обновление раскладки', async () => {
    const s = stand({
      layout: {
        lg: [
          { id: 'a', x: 0, y: 0, w: 4, h: 1 },
          { id: 'b', x: 4, y: 0, w: 4, h: 1 },
          { id: 'c', x: 8, y: 0, w: 4, h: 1 },
        ],
      },
    })

    const targets = ['a', 'b', 'c'].map(id => setContent(s.wrapper, id, 200))

    fireResize(...targets)
    await nextFrame()
    await nextTick()

    expect(s.commits()).toBe(1)
    expect(s.autoResized).toHaveLength(3)
  })

  /**
   * Стопора три: та же высота в пикселях, та же строка, тот же `h` после
   * `resizeItem`. Порознь они взаимозаменяемы — тест краснеет, когда снимают
   * все три, и это ровно та защита, которую он и обязан держать.
   */
  it('повторный замер той же высоты раскладку не трогает', async () => {
    const s = stand()
    const measure = setContent(s.wrapper, 'a', 200)

    fireResize(measure)
    await nextFrame()
    await nextTick()
    const after = s.commits()

    fireResize(measure)
    await nextFrame()
    await nextTick()

    expect(s.commits()).toBe(after)
  })
})
