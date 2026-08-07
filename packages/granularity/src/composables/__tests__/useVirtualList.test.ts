import { effectScope, nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { useVirtualList, type UseVirtualListOptions, type UseVirtualListReturn } from '../useVirtualList'

/**
 * jsdom не считает layout: `getBoundingClientRect` там нулевой, `clientHeight`
 * тоже, а `ResizeObserver` отсутствует. Поэтому геометрия задаётся руками —
 * тест проверяет арифметику окна, а не поведение jsdom.
 */
function createScroller(clientHeight: number): HTMLElement {
  const el = document.createElement('div')
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => clientHeight })
  document.body.appendChild(el)
  return el
}

/** Элемент с заданной высотой: `measure()` читает её как фактическую. */
function createRow(height: number): HTMLElement {
  const el = document.createElement('div')
  Object.defineProperty(el, 'offsetHeight', { configurable: true, get: () => height })
  return el
}

function scrollTo(el: HTMLElement, top: number): void {
  el.scrollTop = top
  el.dispatchEvent(new Event('scroll'))
}

function setup(options: UseVirtualListOptions): UseVirtualListReturn {
  const scope = effectScope()
  const api = scope.run(() => useVirtualList(options))!
  return api
}

describe('useVirtualList', () => {
  it('без элементов отдаёт пустое окно и нулевую распорку', () => {
    const container = ref<HTMLElement | null>(createScroller(200))
    const list = setup({ container, count: () => 0, itemSize: 20 })

    expect(list.range.value).toEqual({ start: 0, end: 0 })
    expect(list.totalSize.value).toBe(0)
    expect(list.offset.value).toBe(0)
  })

  it('считает окно от прокрутки и overscan, а распорку — от оценок', async () => {
    const container = ref<HTMLElement | null>(createScroller(100))
    const list = setup({ container, count: () => 1000, itemSize: 20, overscan: 2 })
    await nextTick()

    // 1000 × 20px: вьюпорт 100px — это пять строк плюс по две сверху и снизу.
    expect(list.totalSize.value).toBe(20_000)
    expect(list.range.value).toEqual({ start: 0, end: 8 })

    scrollTo(container.value!, 400)
    await nextTick()

    // 400px — это строка 20; окно 20..25 расширено overscan'ом в обе стороны.
    expect(list.range.value).toEqual({ start: 18, end: 28 })
    expect(list.offset.value).toBe(360)
  })

  it('до замера контейнера считает окно от `viewportSize`', () => {
    // Сервер и первый клиентский рендер обязаны нарисовать одно и то же окно —
    // иначе гидрация разъедется. Контейнера ещё нет.
    const container = ref<HTMLElement | null>(null)
    const list = setup({
      container,
      count: () => 500,
      itemSize: 25,
      viewportSize: () => 200,
      overscan: 1,
    })

    expect(list.range.value).toEqual({ start: 0, end: 10 })
    expect(list.totalSize.value).toBe(12_500)
  })

  it('без контейнера и без оценки вьюпорта рисует весь список', () => {
    const container = ref<HTMLElement | null>(null)
    const list = setup({ container, count: () => 12, itemSize: 20 })

    // Иначе не отрисовалась бы ни одна строка, а значит и замерить было бы нечего.
    expect(list.range.value).toEqual({ start: 0, end: 12 })
  })

  it('замер строки уточняет распорку и смещения', async () => {
    const container = ref<HTMLElement | null>(createScroller(100))
    const list = setup({ container, count: () => 10, itemSize: 20, overscan: 0 })
    await nextTick()

    expect(list.totalSize.value).toBe(200)

    list.measure(0, createRow(50))
    await nextTick()

    // Одна строка на 30px выше оценки — на столько же вырос весь список.
    expect(list.totalSize.value).toBe(230)
    expect(list.range.value.end).toBeGreaterThan(0)
  })

  it('замер строки выше вьюпорта компенсируется прокруткой — позиция не прыгает', async () => {
    const container = ref<HTMLElement | null>(createScroller(100))
    const list = setup({ container, count: () => 100, itemSize: 20, overscan: 0 })
    await nextTick()

    scrollTo(container.value!, 400)
    await nextTick()

    // Строка 0 давно уехала вверх и оказалась на 30px выше оценки: без
    // компенсации всё содержимое под курсором прыгнуло бы на эти 30px.
    list.measure(0, createRow(50))
    await nextTick()

    expect(container.value!.scrollTop).toBe(430)
    expect(list.offset.value).toBe(430)
  })

  it('замер строки ниже вьюпорта прокрутку не трогает', async () => {
    const container = ref<HTMLElement | null>(createScroller(100))
    const list = setup({ container, count: () => 100, itemSize: 20, overscan: 0 })
    await nextTick()

    scrollTo(container.value!, 400)
    await nextTick()

    list.measure(50, createRow(60))
    await nextTick()

    expect(container.value!.scrollTop).toBe(400)
  })

  it('повторный замер той же высоты ничего не двигает', async () => {
    const container = ref<HTMLElement | null>(createScroller(100))
    const list = setup({ container, count: () => 100, itemSize: 20, overscan: 0 })
    await nextTick()

    scrollTo(container.value!, 400)
    list.measure(0, createRow(50))
    await nextTick()
    const afterFirst = container.value!.scrollTop

    list.measure(0, createRow(50))
    await nextTick()

    expect(container.value!.scrollTop).toBe(afterFirst)
  })

  it('`scrollToIndex` выравнивает по краям и по центру', async () => {
    const container = ref<HTMLElement | null>(createScroller(100))
    const list = setup({ container, count: () => 100, itemSize: 20 })
    await nextTick()

    list.scrollToIndex(50, 'start')
    expect(container.value!.scrollTop).toBe(1000)

    list.scrollToIndex(50, 'end')
    expect(container.value!.scrollTop).toBe(920)

    list.scrollToIndex(50, 'center')
    expect(container.value!.scrollTop).toBe(960)
  })

  it('`scrollToIndex` в режиме `auto` двигает список только когда элемент вне вьюпорта', async () => {
    const container = ref<HTMLElement | null>(createScroller(100))
    const list = setup({ container, count: () => 100, itemSize: 20 })
    await nextTick()

    scrollTo(container.value!, 400)
    await nextTick()

    // Строка 22 (440..460) уже видна целиком — трогать прокрутку незачем.
    list.scrollToIndex(22)
    expect(container.value!.scrollTop).toBe(400)

    list.scrollToIndex(30)
    expect(container.value!.scrollTop).toBe(520)

    list.scrollToIndex(5)
    expect(container.value!.scrollTop).toBe(100)
  })

  it('`scrollToIndex` не уводит за пределы списка', async () => {
    const container = ref<HTMLElement | null>(createScroller(100))
    const list = setup({ container, count: () => 10, itemSize: 20 })
    await nextTick()

    list.scrollToIndex(9, 'start')

    // 200px содержимого при вьюпорте 100px — дальше 100px прокрутки нет.
    expect(container.value!.scrollTop).toBe(100)
  })

  it('сокращение списка снимает замеры исчезнувших строк', async () => {
    const container = ref<HTMLElement | null>(createScroller(100))
    const count = ref(50)
    const list = setup({ container, count: () => count.value, itemSize: 20, overscan: 0 })
    await nextTick()

    list.measure(40, createRow(80))
    await nextTick()
    expect(list.totalSize.value).toBe(1060)

    count.value = 10
    await nextTick()

    // Замер сороковой строки не должен пережить её саму.
    expect(list.totalSize.value).toBe(200)
  })

  it('`offsetEnd` закрывает срезанное снизу: сумма отступов и окна равна списку', async () => {
    const container = ref<HTMLElement | null>(createScroller(100))
    const list = setup({ container, count: () => 100, itemSize: 20, overscan: 0 })
    await nextTick()

    scrollTo(container.value!, 400)
    await nextTick()

    const { start, end } = list.range.value
    const windowSize = (end - start) * 20

    expect(list.offset.value + windowSize + list.offsetEnd.value).toBe(list.totalSize.value)
  })

  it('учитывает зазор между строками: замер коробки его не видит', async () => {
    const container = ref<HTMLElement | null>(createScroller(100))
    const list = setup({ container, count: () => 100, itemSize: 20, gap: 2, overscan: 0 })
    await nextTick()

    // Шаг раскладки — 22px, а не 20: без этого окно уползало бы тем сильнее,
    // чем дальше прокрутка.
    expect(list.totalSize.value).toBe(2200)

    scrollTo(container.value!, 440)
    await nextTick()

    expect(list.range.value.start).toBe(20)
    expect(list.offset.value).toBe(440)
  })

  it('работает без `ResizeObserver`', async () => {
    const original = globalThis.ResizeObserver
    // @ts-expect-error — проверяем именно отсутствие API.
    delete globalThis.ResizeObserver

    try {
      const container = ref<HTMLElement | null>(createScroller(100))
      const list = setup({ container, count: () => 100, itemSize: 20, overscan: 0 })
      await nextTick()

      scrollTo(container.value!, 200)
      await nextTick()

      expect(list.range.value).toEqual({ start: 10, end: 16 })
      list.measure(0, createRow(30))
      await nextTick()
      expect(list.totalSize.value).toBe(2010)
    }
    finally {
      if (original) globalThis.ResizeObserver = original
    }
  })
})
