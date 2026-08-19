/**
 * Единственное место, где раскладка переводится в пиксели.
 *
 * Метрика считается **один раз на жест**: ширина контейнера и шаг ячейки
 * читаются на `pointerdown` и дальше не меняются. Замер на каждое движение
 * указателя — это принудительный reflow сорок раз в секунду.
 */
import type { GrDashboardItemLayout } from './layoutModel'
import type { GrDashboardSpan } from './layoutMove'

export interface GrDashboardMetrics {
  /** Ширина контейнера, px. */
  width: number
  cols: number
  /** Ширина одной колонки без зазора, px. */
  colWidth: number
  /** Высота одной строки без зазора, px. */
  rowHeight: number
  gap: number
}

export interface GrDashboardRect {
  left: number
  top: number
  width: number
  height: number
}

export function metricsOf(width: number, cols: number, rowHeight: number, gap: number): GrDashboardMetrics {
  const safeCols = Math.max(1, Math.round(cols))
  const colWidth = Math.max(0, (width - gap * (safeCols - 1)) / safeCols)

  return { width, cols: safeCols, colWidth, rowHeight, gap }
}

/** Шаг сетки по горизонтали: колонка вместе с зазором. */
export function colStep(metrics: GrDashboardMetrics): number {
  return metrics.colWidth + metrics.gap
}

export function rowStep(metrics: GrDashboardMetrics): number {
  return metrics.rowHeight + metrics.gap
}

export function rectOfItem(item: GrDashboardItemLayout, metrics: GrDashboardMetrics): GrDashboardRect {
  return {
    left: item.x * colStep(metrics),
    top: item.y * rowStep(metrics),
    width: item.w * metrics.colWidth + (item.w - 1) * metrics.gap,
    height: item.h * metrics.rowHeight + (item.h - 1) * metrics.gap,
  }
}

/**
 * Ячейка, в которую попадает левый верхний угол, сдвинутый на `dx`/`dy`.
 *
 * Округление, а не отсечение: виджет переезжает в соседнюю ячейку на середине
 * пути, и жест ощущается предсказуемым — иначе последняя половина ячейки
 * выглядит «залипанием».
 */
export function cellFromDelta(
  item: GrDashboardItemLayout,
  metrics: GrDashboardMetrics,
  dx: number,
  dy: number,
): { x: number, y: number } {
  const origin = rectOfItem(item, metrics)

  return {
    x: Math.round((origin.left + dx) / colStep(metrics)),
    y: Math.round((origin.top + dy) / rowStep(metrics)),
  }
}

/**
 * Ячейка, в которую попадает точка внутри сетки. `x`/`y` — пиксели от её левого
 * верхнего угла.
 *
 * `cellFromDelta` считает от прямоугольника виджета, который уже в раскладке; у
 * пришедшего из каталога прямоугольника ещё нет — есть только курсор и будущий
 * размер. Поэтому при заданном `span` точка считается **центром** виджета: его
 * призрак висит под курсором, и место обязано лечь под него, а не правее и ниже.
 *
 * Нулевая ширина контейнера — это «не отрисовано», а не «сетка шириной в ноль»:
 * точка в такой сетке не лежит по определению, и считать по ней ячейку значило
 * бы отдать наружу выдуманное число.
 */
export function cellFromPoint(
  metrics: GrDashboardMetrics,
  x: number,
  y: number,
  span?: GrDashboardSpan,
): { x: number, y: number } {
  const col = colStep(metrics)
  const row = rowStep(metrics)
  if (metrics.width <= 0 || col <= 0 || row <= 0) return { x: 0, y: 0 }

  const w = Math.max(1, Math.round(span?.w ?? 1))
  const h = Math.max(1, Math.round(span?.h ?? 1))

  const left = span ? x - (w * metrics.colWidth + (w - 1) * metrics.gap) / 2 : x
  const top = span ? y - (h * metrics.rowHeight + (h - 1) * metrics.gap) / 2 : y

  return {
    x: Math.min(Math.max(0, Math.round(left / col)), Math.max(0, metrics.cols - w)),
    y: Math.max(0, Math.round(top / row)),
  }
}

/** Размер в ячейках, к которому приводит растягивание уголка на `dw`/`dh`. */
export function spanFromDelta(
  item: GrDashboardItemLayout,
  metrics: GrDashboardMetrics,
  dw: number,
  dh: number,
): { w: number, h: number } {
  const origin = rectOfItem(item, metrics)

  return {
    w: Math.max(1, Math.round((origin.width + dw + metrics.gap) / colStep(metrics))),
    h: Math.max(1, Math.round((origin.height + dh + metrics.gap) / rowStep(metrics))),
  }
}
