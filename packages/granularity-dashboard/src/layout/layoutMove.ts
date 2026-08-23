/**
 * Перемещение и растягивание. Обе операции иммутабельны: на вход раскладка,
 * на выход новая: массив никогда не мутируется на месте, потому что он же
 * лежит в `shallowRef` компонента и сравнивается по ссылке.
 */
import type {
  GrDashboardCompaction,
  GrDashboardItemLayout,
  GrDashboardLayout,
} from './layoutModel'
import { clampHeight, clampItem, clampWidth, sortLayout } from './layoutModel'
import { compact, resolveCollisions } from './layoutCollision'

export interface GrDashboardMoveOptions {
  cols: number
  compact?: GrDashboardCompaction
  preventCollision?: boolean
}

export interface GrDashboardCell {
  x: number
  y: number
}

export interface GrDashboardSpan {
  w: number
  h: number
}

function apply(
  layout: GrDashboardLayout,
  id: string,
  next: GrDashboardItemLayout,
  options: GrDashboardMoveOptions,
): GrDashboardLayout {
  const placed = layout.map(item => (item.id === id ? next : item))
  const resolved = resolveCollisions(placed, id, { preventCollision: options.preventCollision })
  if (!resolved)
    return sortLayout(layout)

  return compact(resolved, options.compact ?? 'vertical')
}

/**
 * Ставит виджет в ячейку. Отказ (статика, `preventCollision`) возвращает
 * исходную раскладку — вызывающий вправе сравнить ссылку и понять, что ничего
 * не произошло.
 */
export function moveItem(
  layout: GrDashboardLayout,
  id: string,
  cell: GrDashboardCell,
  options: GrDashboardMoveOptions,
): GrDashboardLayout {
  const item = layout.find(entry => entry.id === id)
  if (!item || item.static)
    return sortLayout(layout)

  const next = clampItem({ ...item, x: cell.x, y: cell.y }, options.cols)
  if (next.x === item.x && next.y === item.y)
    return sortLayout(layout)

  return apply(layout, id, next, options)
}

/**
 * Меняет размер виджета. Левый верхний угол остаётся на месте: растёт виджет
 * вправо и вниз — это и есть жест за правый нижний уголок.
 */
export function resizeItem(
  layout: GrDashboardLayout,
  id: string,
  span: GrDashboardSpan,
  options: GrDashboardMoveOptions,
): GrDashboardLayout {
  const item = layout.find(entry => entry.id === id)
  if (!item || item.static)
    return sortLayout(layout)

  const w = Math.min(clampWidth(item, span.w, options.cols), options.cols - item.x)
  const h = clampHeight(item, span.h)
  if (w === item.w && h === item.h)
    return sortLayout(layout)

  return apply(layout, id, { ...item, w, h }, options)
}

/**
 * Кладёт новый виджет в раскладку.
 *
 * Ячейка не задана — виджет встаёт под низ сетки: любое другое место означало
 * бы двигать чужие виджеты ради вновь пришедшего.
 */
export function addItem(
  layout: GrDashboardLayout,
  item: GrDashboardItemLayout,
  options: GrDashboardMoveOptions,
  cell?: GrDashboardCell,
): GrDashboardLayout {
  const rows = layout.reduce((max, entry) => Math.max(max, entry.y + entry.h), 0)
  const placed = clampItem({ ...item, x: cell?.x ?? 0, y: cell?.y ?? rows }, options.cols)

  return apply([...layout, placed], placed.id, placed, options)
}

export function removeItem(layout: GrDashboardLayout, id: string, options: GrDashboardMoveOptions): GrDashboardLayout {
  return compact(layout.filter(item => item.id !== id), options.compact ?? 'vertical')
}
