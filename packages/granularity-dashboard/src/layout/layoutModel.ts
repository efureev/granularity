/**
 * Модель раскладки: типы и приведение к каноническому виду.
 *
 * Все величины — **целые ячейки**, не пиксели. Пиксели появляются только в
 * `layoutGeometry` и живут внутри одного жеста.
 */

/** Место одного виджета в сетке. */
export interface GrDashboardItemLayout {
  /** Идентификатор виджета. Совпадает с `itemId` у `GrDashboardItem`. */
  id: string
  /** Колонка левого края, от нуля. */
  x: number
  /** Строка верхнего края, от нуля. */
  y: number
  /** Ширина в колонках. */
  w: number
  /** Высота в строках. */
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  /** Не двигается сам и не двигается соседями. */
  static?: boolean
}

export type GrDashboardLayout = GrDashboardItemLayout[]

/** Ключ брейкпоинта. Набор открыт: имена задаёт приложение. */
export type GrDashboardBreakpoint = string

/** Раскладка на каждый брейкпоинт. Недостающий выводится из соседнего. */
export type GrDashboardResponsiveLayout = Record<GrDashboardBreakpoint, GrDashboardLayout>

/** Пороги ширины контейнера, от которых начинается брейкпоинт. */
export type GrDashboardBreakpoints = Record<GrDashboardBreakpoint, number>

/** Число колонок на брейкпоинте. */
export type GrDashboardCols = Record<GrDashboardBreakpoint, number>

/**
 * Как раскладка ведёт себя после переноса.
 *
 * `vertical` — виджеты падают вверх, дыр не остаётся; `none` — виджет остаётся
 * ровно там, куда его положили.
 */
export type GrDashboardCompaction = 'vertical' | 'none'

export const GR_DASHBOARD_BREAKPOINTS: GrDashboardBreakpoints = { lg: 1200, md: 996, sm: 768, xs: 480 }

export const GR_DASHBOARD_COLS: GrDashboardCols = { lg: 12, md: 10, sm: 6, xs: 2 }

function toInt(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.round(value) : fallback
}

/** Нижняя граница ширины виджета с учётом объявленного `minW`. */
export function minWidthOf(item: GrDashboardItemLayout): number {
  return Math.max(1, toInt(item.minW ?? 1, 1))
}

export function minHeightOf(item: GrDashboardItemLayout): number {
  return Math.max(1, toInt(item.minH ?? 1, 1))
}

/**
 * Верхняя граница ширины: объявленный `maxW`, но не шире сетки.
 *
 * Противоречие `maxW < minW` разрешается в пользу `minW`: виджет, объявивший
 * «мне нужно не меньше четырёх колонок», в трёх нарисуется сломанным, а
 * лишняя колонка — всего лишь пустое место.
 */
export function maxWidthOf(item: GrDashboardItemLayout, cols: number): number {
  const declared = item.maxW === undefined ? cols : toInt(item.maxW, cols)
  return Math.max(minWidthOf(item), Math.min(cols, declared))
}

export function maxHeightOf(item: GrDashboardItemLayout): number {
  const declared = item.maxH === undefined ? Number.POSITIVE_INFINITY : toInt(item.maxH, Number.POSITIVE_INFINITY)
  return Math.max(minHeightOf(item), declared)
}

/**
 * Ширина в границах виджета и сетки.
 *
 * Сетка — последняя граница, и она сильнее `minW`: виджет, которому «нужно не
 * меньше четырёх колонок», на двухколоночном брейкпоинте занимает обе, а не
 * вылезает за край. Иначе он добавляет сетке неявную колонку нулевой ширины и
 * рвёт инвариант «`x + w <= cols`» — молча, потому что CSS Grid такую колонку
 * послушно создаёт.
 */
export function clampWidth(item: GrDashboardItemLayout, width: number, cols: number): number {
  const bounded = Math.min(maxWidthOf(item, cols), Math.max(minWidthOf(item), toInt(width, 1)))

  return Math.min(Math.max(1, Math.round(cols)), bounded)
}

export function clampHeight(item: GrDashboardItemLayout, height: number): number {
  return Math.min(maxHeightOf(item), Math.max(minHeightOf(item), toInt(height, 1)))
}

/** Приводит запись к инвариантам: целые ячейки, границы, отсутствие свеса за край. */
export function clampItem(item: GrDashboardItemLayout, cols: number): GrDashboardItemLayout {
  const w = clampWidth(item, item.w, cols)
  const h = clampHeight(item, item.h)
  const x = Math.min(Math.max(0, toInt(item.x, 0)), Math.max(0, cols - w))
  const y = Math.max(0, toInt(item.y, 0))

  return item.x === x && item.y === y && item.w === w && item.h === h
    ? item
    : { ...item, x, y, w, h }
}

/**
 * Канонический порядок: сверху вниз, слева направо.
 *
 * Порядок массива смысла не несёт — его несёт пара `(y, x)`. Сравнивать две
 * раскладки нужно после этой функции, иначе перестановка элементов местами
 * читается как изменение.
 */
export function sortLayout(layout: GrDashboardLayout): GrDashboardLayout {
  return [...layout].sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id))
}

export function normalizeLayout(layout: GrDashboardLayout, cols: number): GrDashboardLayout {
  return sortLayout(layout.map(item => clampItem(item, cols)))
}

export function findItem(layout: GrDashboardLayout, id: string): GrDashboardItemLayout | undefined {
  return layout.find(item => item.id === id)
}

/** Сколько строк занимает раскладка. */
export function rowsOf(layout: GrDashboardLayout): number {
  return layout.reduce((rows, item) => Math.max(rows, item.y + item.h), 0)
}
