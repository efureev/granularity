import { effectScope, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import {
  gridCellKey,
  HEADER_ROW_INDEX,
  parseGridCellKey,
  useDataTableGridNavigation,
} from '../composables/useDataTableGridNavigation'

/**
 * Ячейки существуют в DOM: `focus()` по отсутствующему узлу молча ничего не
 * делает, и проверка фокуса выродилась бы в тавтологию.
 */
function setup(options: {
  columns?: number
  rows?: number[]
  totalRows?: number
  enabled?: boolean
  scrollToRow?: (index: number) => void
} = {}) {
  const columns = options.columns ?? 3
  const rendered = ref(options.rows ?? [0, 1, 2])
  const host = document.createElement('div')
  document.body.append(host)

  const cellEls = new Map<string, HTMLElement>()

  function build(): void {
    for (const row of [HEADER_ROW_INDEX, ...rendered.value]) {
      for (let column = 0; column < columns; column++) {
        const key = gridCellKey(row, column)
        if (cellEls.has(key))
          continue

        const el = document.createElement('td')
        el.dataset.key = key
        el.tabIndex = -1

        const button = document.createElement('button')
        button.dataset.inner = key
        el.append(button)

        host.append(el)
        cellEls.set(key, el)
      }
    }
  }

  build()

  const scope = effectScope()
  const grid = scope.run(() => useDataTableGridNavigation({
    enabled: () => options.enabled ?? true,
    columns: () => columns,
    renderedRows: () => rendered.value,
    totalRows: () => options.totalRows ?? rendered.value.length,
    cellEls,
    scrollToRow: options.scrollToRow,
  }))!

  return {
    grid,
    rendered,
    build,
    cellEls,
    focused: () => (document.activeElement as HTMLElement | null)?.dataset.key,
    dispose: () => {
      scope.stop()
      host.remove()
    },
  }
}

function press(name: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: name, cancelable: true })
}

describe('ключ ячейки', () => {
  it('разбирается обратно, включая строку шапки', () => {
    expect(parseGridCellKey(gridCellKey(4, 2))).toEqual({ row: 4, column: 2 })
    expect(parseGridCellKey(gridCellKey(HEADER_ROW_INDEX, 0))).toEqual({ row: -1, column: 0 })
  })
})

describe('навигация по ячейкам', () => {
  it('остановка Tab одна на всю таблицу и стоит в шапке', () => {
    const { grid, dispose } = setup()

    expect(grid.rovingKey.value).toBe(gridCellKey(HEADER_ROW_INDEX, 0))
    expect(grid.tabindexFor(HEADER_ROW_INDEX, 0)).toBe(0)
    expect(grid.tabindexFor(HEADER_ROW_INDEX, 1)).toBe(-1)
    expect(grid.tabindexFor(0, 0)).toBe(-1)

    dispose()
  })

  it('вертикаль ходит по строкам, горизонталь — по колонкам', () => {
    const { grid, dispose } = setup()

    grid.setActive(0, 1)
    expect(grid.onKeydown(press('ArrowDown'))).toBe(true)
    expect(grid.rovingKey.value).toBe(gridCellKey(1, 1))

    grid.onKeydown(press('ArrowRight'))
    expect(grid.rovingKey.value).toBe(gridCellKey(1, 2))

    grid.onKeydown(press('ArrowUp'))
    expect(grid.rovingKey.value).toBe(gridCellKey(0, 2))

    dispose()
  })

  it('Home и End — края строки, а не всей таблицы', () => {
    const { grid, dispose } = setup()

    grid.setActive(1, 1)
    grid.onKeydown(press('Home'))
    expect(grid.rovingKey.value).toBe(gridCellKey(1, 0))

    grid.onKeydown(press('End'))
    expect(grid.rovingKey.value).toBe(gridCellKey(1, 2))

    dispose()
  })

  /**
   * У списка зацикливание уместно, у сетки нет: строка ниже последней — это не
   * первая, а «дальше некуда». Замкни кольцо — и стрелка вниз в конце таблицы
   * увозила бы фокус в шапку.
   */
  it('кольцо не замкнуто ни по строкам, ни по колонкам', () => {
    const { grid, dispose } = setup()

    grid.setActive(2, 2)
    grid.onKeydown(press('ArrowDown'))
    expect(grid.rovingKey.value).toBe(gridCellKey(2, 2))

    grid.onKeydown(press('ArrowRight'))
    expect(grid.rovingKey.value).toBe(gridCellKey(2, 2))

    grid.setActive(HEADER_ROW_INDEX, 0)
    grid.onKeydown(press('ArrowUp'))
    expect(grid.rovingKey.value).toBe(gridCellKey(HEADER_ROW_INDEX, 0))

    dispose()
  })

  it('шапка — такая же строка сетки: из неё вниз попадаешь в первую строку данных', () => {
    const { grid, dispose } = setup()

    grid.setActive(HEADER_ROW_INDEX, 2)
    grid.onKeydown(press('ArrowDown'))
    expect(grid.rovingKey.value).toBe(gridCellKey(0, 2))

    grid.onKeydown(press('ArrowUp'))
    expect(grid.rovingKey.value).toBe(gridCellKey(HEADER_ROW_INDEX, 2))

    dispose()
  })

  it('выключенная навигация не занимает ни одной клавиши', () => {
    const { grid, dispose } = setup({ enabled: false })

    expect(grid.onKeydown(press('ArrowDown'))).toBe(false)
    expect(grid.tabindexFor(HEADER_ROW_INDEX, 0)).toBe(-1)

    dispose()
  })

  it('чужая клавиша не перехватывается', () => {
    const { grid, dispose } = setup()

    // `Enter` и `F2` сетке принадлежат — ими входят в ячейку (ниже).
    expect(grid.onKeydown(press('a'))).toBe(false)
    expect(grid.onKeydown(press('Tab'))).toBe(false)
    expect(grid.onKeydown(press('PageDown'))).toBe(false)

    dispose()
  })
})

describe('край окна виртуализации', () => {
  /**
   * Набор — отрисованное окно, а не вся таблица: шестьдесят тысяч ключей на
   * десять тысяч строк пересобирались бы при каждом чтении. Поэтому шаг за
   * край окна — это не край таблицы, а просьба прокрутить.
   */
  it('шаг вниз за окно просит прокрутить к следующей строке', () => {
    const scrollToRow = vi.fn()
    const { grid, dispose } = setup({ rows: [10, 11, 12], totalRows: 500, scrollToRow })

    grid.setActive(12, 1)
    grid.onKeydown(press('ArrowDown'))

    expect(scrollToRow).toHaveBeenCalledWith(13)

    dispose()
  })

  /**
   * Шапка стоит в наборе первой, поэтому примитив увёл бы стрелку вверх из
   * первой отрисованной строки **в шапку** — мимо девяти строк выше окна.
   * Край набора и край таблицы здесь разные вещи.
   */
  it('шаг вверх из первой строки окна прокручивает, а не уходит в шапку', () => {
    const scrollToRow = vi.fn()
    const { grid, dispose } = setup({ rows: [10, 11, 12], totalRows: 500, scrollToRow })

    grid.setActive(10, 1)
    grid.onKeydown(press('ArrowUp'))

    expect(scrollToRow).toHaveBeenCalledWith(9)

    dispose()
  })

  it('из шапки вверх идти некуда, и список от этого не едет', () => {
    const scrollToRow = vi.fn()
    const { grid, dispose } = setup({ rows: [10, 11, 12], totalRows: 500, scrollToRow })

    grid.setActive(HEADER_ROW_INDEX, 1)
    grid.onKeydown(press('ArrowUp'))

    expect(scrollToRow).not.toHaveBeenCalled()
    expect(grid.rovingKey.value).toBe(gridCellKey(HEADER_ROW_INDEX, 1))

    dispose()
  })

  it('окно с самого начала: вверх из первой строки — в шапку, без прокрутки', () => {
    const scrollToRow = vi.fn()
    const { grid, dispose } = setup({ rows: [0, 1, 2], totalRows: 500, scrollToRow })

    grid.setActive(0, 1)
    grid.onKeydown(press('ArrowUp'))

    expect(scrollToRow).not.toHaveBeenCalled()
    expect(grid.rovingKey.value).toBe(gridCellKey(HEADER_ROW_INDEX, 1))

    dispose()
  })

  it('на настоящем краю таблицы не прокручивает', () => {
    const scrollToRow = vi.fn()
    const { grid, dispose } = setup({ rows: [497, 498, 499], totalRows: 500, scrollToRow })

    grid.setActive(499, 0)
    grid.onKeydown(press('ArrowDown'))

    expect(scrollToRow).not.toHaveBeenCalled()

    dispose()
  })

  it('горизонтальный край строки прокруткой не лечится', () => {
    const scrollToRow = vi.fn()
    const { grid, dispose } = setup({ rows: [10, 11, 12], totalRows: 500, scrollToRow })

    grid.setActive(11, 2)
    grid.onKeydown(press('ArrowRight'))

    expect(scrollToRow).not.toHaveBeenCalled()

    dispose()
  })

  it('без виртуализации край окна — это край таблицы', () => {
    const { grid, dispose } = setup({ rows: [0, 1, 2] })

    grid.setActive(2, 0)
    grid.onKeydown(press('ArrowDown'))
    expect(grid.rovingKey.value).toBe(gridCellKey(2, 0))

    dispose()
  })
})

/**
 * Сетка забирает `Tab` себе, поэтому без входа в ячейку кнопка сортировки,
 * чекбокс или ссылка внутри неё стали бы недостижимы с клавиатуры вовсе.
 * Половина паттерна здесь хуже его отсутствия.
 */
describe('вход в ячейку и выход из неё', () => {
  function inner(): string | undefined {
    return (document.activeElement as HTMLElement | null)?.dataset.inner
  }

  it('Enter и F2 отдают фокус содержимому ячейки', () => {
    const { grid, cellEls, dispose } = setup()

    grid.setActive(1, 1)
    cellEls.get(gridCellKey(1, 1))!.focus()

    expect(grid.onKeydown(press('Enter'))).toBe(true)
    expect(inner()).toBe(gridCellKey(1, 1))

    dispose()
  })

  it('Escape возвращает фокус самой ячейке', () => {
    const { grid, cellEls, dispose } = setup()
    const cell = cellEls.get(gridCellKey(1, 1))!

    grid.setActive(1, 1)
    cell.focus()
    grid.onKeydown(press('F2'))
    expect(inner()).toBe(gridCellKey(1, 1))

    expect(grid.onKeydown(press('Escape'))).toBe(true)
    expect(document.activeElement).toBe(cell)
    expect(inner()).toBeUndefined()

    dispose()
  })

  it('когда фокус уже внутри, Enter принадлежит содержимому, а не сетке', () => {
    const { grid, cellEls, dispose } = setup()
    const cell = cellEls.get(gridCellKey(1, 1))!

    grid.setActive(1, 1)
    cell.focus()
    grid.onKeydown(press('Enter'))

    // Второй Enter сетка не перехватывает: его ждёт кнопка под фокусом.
    expect(grid.onKeydown(press('Enter'))).toBe(false)

    dispose()
  })

  it('Escape вне ячейки сетку не касается — его ждёт панель или окно', () => {
    const { grid, cellEls, dispose } = setup()

    grid.setActive(1, 1)
    cellEls.get(gridCellKey(1, 1))!.focus()

    expect(grid.onKeydown(press('Escape'))).toBe(false)

    dispose()
  })
})
