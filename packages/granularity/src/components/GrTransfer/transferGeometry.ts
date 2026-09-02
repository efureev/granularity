import type { DragSortSpan } from '../../composables/internal/dragSortGeometry'
import { hitTest } from '../../composables/internal/dragSortGeometry'
import type { GrTransferKey, GrTransferSide } from './transferModel'

/**
 * Геометрия переноса между двумя панелями: чистая арифметика, без DOM.
 *
 * В jsdom раскладки нет — `getBoundingClientRect` там нули, — поэтому всё, что
 * решает «куда попал указатель», живёт здесь и проверяется числами. Тот же
 * довод, что у `dragSortGeometry` и `scrollOverflow`.
 */

/** Порог начала жеста. То же число, что у `useDragSort` и у переноса дашборда. */
export const GR_TRANSFER_DRAG_THRESHOLD = 4

export interface GrTransferRect {
  left: number
  right: number
  top: number
  bottom: number
}

export interface GrTransferPoint {
  x: number
  y: number
}

export interface GrTransferPanelRects {
  source: GrTransferRect | null
  target: GrTransferRect | null
}

function contains(rect: GrTransferRect, point: GrTransferPoint): boolean {
  return point.x >= rect.left && point.x <= rect.right
    && point.y >= rect.top && point.y <= rect.bottom
}

/**
 * Панель под указателем; `null` — указатель в зазоре или за пределами обеих.
 *
 * Считается по прямоугольнику **обёртки панели**, а не по ближайшей строке:
 * `hitTest` при промахе возвращает ближайший элемент, и указатель над пустой
 * правой панелью резолвился бы в строку левой.
 */
export function sideAtPoint(
  rects: GrTransferPanelRects,
  point: GrTransferPoint,
): GrTransferSide | null {
  if (rects.source && contains(rects.source, point))
    return 'source'

  if (rects.target && contains(rects.target, point))
    return 'target'

  return null
}

/**
 * Перед какой строкой встанет блок; `null` — в конец панели.
 *
 * Цель — ключ, а не индекс: индекс пришлось бы пересчитывать после изъятия
 * блока, и именно ради этого `insertionIndex` в `dragSortGeometry` носит
 * поправку «элемент временно вынут». Для вставки из чужой панели поправка
 * вредна — там ничего не вынимается, — поэтому та функция здесь не годится.
 */
export function dropBefore(
  keys: readonly GrTransferKey[],
  spans: readonly DragSortSpan[],
  position: number,
): GrTransferKey | null {
  if (keys.length === 0 || spans.length === 0)
    return null

  const hit = hitTest(spans, position)
  if (!hit)
    return null

  const index = hit.fraction < 0.5 ? hit.index : hit.index + 1

  return index >= keys.length ? null : keys[index] ?? null
}

/** Пройден ли порог начала жеста. */
export function passedThreshold(
  from: GrTransferPoint,
  to: GrTransferPoint,
  threshold: number = GR_TRANSFER_DRAG_THRESHOLD,
): boolean {
  return Math.hypot(to.x - from.x, to.y - from.y) >= threshold
}
