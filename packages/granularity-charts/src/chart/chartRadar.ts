import { angleOfPoint, type Point, polarPoint } from './chartArc'
import type { GrChartSeries, NormalizedSeries } from './chartModel'

/**
 * Геометрия паутины: спицы, кольца, замкнутый контур серии, попадание по оси.
 *
 * Модуль чистый — ни Vue, ни DOM. Углы берутся из `chartArc`: там же конвенция
 * «ноль вверху, растёт по часовой», и разводить две полярные системы координат
 * в одном пакете было бы источником вечных знаковых ошибок.
 */

const TAU = Math.PI * 2

/** Округление то же, что у дуг: короче разметка и читаемый diff снимка. */
function n(value: number): number {
  return Math.round(value * 100) / 100
}

/** Углы спиц: равномерно по кругу, первая — под `startAngle`. */
export function radarAxisAngles(count: number, startAngle = 0): number[] {
  const total = Math.max(0, Math.floor(count))

  return Array.from({ length: total }, (_, index) => startAngle + (index * TAU) / total)
}

/**
 * Выравнивание серий по объединённому набору осей.
 *
 * Без него радар разъезжается на скрытии серии, и разъезжается тихо.
 * `normalizeChartData` собирает категории по **всем** сериям, а позиции — по
 * **видимым**; у декартовых графиков это верно (скрытый ряд не должен держать
 * ось растянутой), а у радара позиция это спица. Спрячь единственную серию,
 * знавшую про ось «Поддержка», — и паутина провернётся, потеряв ориентиры, а
 * хит-тест начнёт адресовать соседнюю ось.
 *
 * Лечение простое: каждая серия дополняется пропусками до общего списка осей.
 * Пропуск позицию удерживает — `collectPositions` берёт `point.x` независимо
 * от того, есть ли значение.
 */
export function alignSeriesToAxes(series: readonly GrChartSeries[]): GrChartSeries[] {
  const axes: string[] = []
  const seen = new Set<string>()

  for (const item of series) {
    const names = item.data ? item.data.map(point => String(point.x)) : (item.x ?? []).map(String)

    for (const name of names) {
      if (seen.has(name))
        continue

      seen.add(name)
      axes.push(name)
    }
  }

  return series.map((item) => {
    const byAxis = new Map<string, number | null>()

    if (item.data) {
      for (const point of item.data)
        byAxis.set(String(point.x), point.y)
    }
    else {
      const values = item.y ?? []

      ;(item.x ?? []).forEach((axis, index) => byAxis.set(String(axis), values[index] ?? null))
    }

    return {
      ...item,
      data: undefined,
      x: axes,
      y: axes.map(axis => byAxis.get(axis) ?? null),
    }
  })
}

/**
 * Верхняя граница каждой оси при нормировке на ось.
 *
 * Ось, на которой нечего показывать (все значения пусты, нулевые или
 * отрицательные), получает единицу, а не ноль: домен `[0, 0]` даёт шкалу без
 * размаха, и все точки сели бы на середину радиуса — бодрый многоугольник из
 * нулей.
 */
export function perAxisMaxima(
  series: readonly NormalizedSeries[],
  positions: readonly number[],
): number[] {
  return positions.map((x) => {
    let max = 0

    for (const item of series) {
      if (item.hidden)
        continue

      const value = item.points.find(point => point.x === x)?.y

      if (typeof value === 'number' && Number.isFinite(value) && value > max)
        max = value
    }

    return max > 0 ? max : 1
  })
}

export interface RadarSegments {
  segments: Point[][]
  /** Контур замкнут только тогда, когда пропусков нет вовсе. */
  closed: boolean
}

/**
 * Непрерывные куски контура с учётом **шва**.
 *
 * Обход начинается с вершины сразу после пропуска, а не с нулевой. Иначе кусок,
 * лежащий на стыке конца и начала массива, распался бы надвое, и контур
 * разошёлся бы ровно на двенадцати часах — на глаз это читается как случайная
 * щель, а не как отсутствие данных.
 */
export function radarSegments(vertices: readonly (Point | null)[]): RadarSegments {
  const total = vertices.length

  if (total === 0)
    return { segments: [], closed: false }

  if (vertices.every(vertex => vertex !== null))
    return { segments: [vertices as Point[]], closed: true }

  const start = vertices.findIndex(
    (vertex, index) => vertex !== null && vertices[(index - 1 + total) % total] === null,
  )

  if (start === -1)
    return { segments: [], closed: false }

  const segments: Point[][] = []
  let current: Point[] = []

  for (let step = 0; step < total; step++) {
    // `?? null` не косметика: индексация может дать `undefined`, а ветка ниже
    // сужает только `null`.
    const vertex = vertices[(start + step) % total] ?? null

    if (vertex === null) {
      if (current.length > 0) {
        segments.push(current)
        current = []
      }
      continue
    }

    current.push(vertex)
  }

  if (current.length > 0)
    segments.push(current)

  return { segments, closed: false }
}

function polyline(points: readonly Point[]): string {
  const first = points[0]!

  return [
    `M ${n(first.x)} ${n(first.y)}`,
    ...points.slice(1).map(point => `L ${n(point.x)} ${n(point.y)}`),
  ].join(' ')
}

/** Контур серии: замкнутый многоугольник либо ломаная из кусков. */
export function radarLinePath(segments: readonly Point[][], closed: boolean): string {
  return segments
    .filter(segment => segment.length > 1)
    .map(segment => (closed ? `${polyline(segment)} Z` : polyline(segment)))
    .join(' ')
}

/**
 * Заливка контура. Разрыв отменяет её целиком.
 *
 * Незамкнутый путь SVG замыкает сам, то есть нарисовал бы площадь через
 * пропуск — данные, которых не измеряли. Полупустая паутина честнее ложной.
 */
export function radarAreaPath(vertices: readonly (Point | null)[]): string {
  if (vertices.length < 3 || vertices.includes(null))
    return ''

  return `${polyline(vertices as Point[])} Z`
}

/** Кольцо сетки многоугольником. Круглую сетку рисует `<circle>` — там нечего считать. */
export function radarRingPath(
  cx: number,
  cy: number,
  radius: number,
  angles: readonly number[],
): string {
  if (!(radius > 0) || angles.length < 3)
    return ''

  return `${polyline(angles.map(angle => polarPoint(cx, cy, radius, angle)))} Z`
}

export interface RadarHitBounds {
  /** Мёртвая зона у центра: там все спицы равноудалены, и выбор был бы наугад. */
  minRadius: number
  maxRadius: number
}

/**
 * Ось под курсором — ближайшая спица.
 *
 * Диск делится между спицами нацело: у радара, в отличие от столбцов, между
 * осями не пусто — там натянут контур, и «промах между осями» читался бы как
 * поломка. Промахнуться можно только наружу и в самый центр.
 */
export function nearestAxis(
  cx: number,
  cy: number,
  x: number,
  y: number,
  count: number,
  startAngle: number,
  bounds: RadarHitBounds,
): number {
  const total = Math.max(0, Math.floor(count))

  if (total === 0)
    return -1

  const distance = Math.hypot(x - cx, y - cy)

  if (distance < bounds.minRadius || distance > bounds.maxRadius)
    return -1

  const step = TAU / total
  const angle = (angleOfPoint(cx, cy, x, y) - startAngle % TAU + TAU * 2) % TAU

  // Остаток обязателен: сектор, перешагнувший через двенадцать часов,
  // округляется вверх до `total` и адресовал бы позицию, которой нет.
  return Math.round(angle / step) % total
}

/**
 * Куда тянуть подпись оси.
 *
 * Допуск не косметика: у двенадцати и шести часов синус проходит через ноль, и
 * без него якорь прыгал бы между `middle` и `start` от ошибки округления при
 * ненулевом `startAngle`.
 */
export function radarLabelAnchor(angle: number): 'start' | 'middle' | 'end' {
  const offset = Math.sin(angle)

  if (Math.abs(offset) < 0.05)
    return 'middle'

  return offset > 0 ? 'start' : 'end'
}
