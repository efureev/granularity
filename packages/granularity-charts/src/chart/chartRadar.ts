import { angleOfPoint, type Point, polarPoint, svgCoord } from './chartArc'
import { estimateTextWidth, fitLabel, type Rect } from './chartLayout'
import type { GrChartSeries, NormalizedSeries } from './chartModel'

/**
 * Геометрия паутины: спицы, кольца, замкнутый контур серии, попадание по оси.
 *
 * Модуль чистый — ни Vue, ни DOM. Углы берутся из `chartArc`: там же конвенция
 * «ноль вверху, растёт по часовой», и разводить две полярные системы координат
 * в одном пакете было бы источником вечных знаковых ошибок.
 */

const TAU = Math.PI * 2

/** Округление то же, что у дуг: одинаковая строка на сервере и в браузере. */
const n = svgCoord

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

/** Подпись оси: основная строка и, при нормировке на ось, вторая — её потолок. */
export interface RadarAxisLabelInput {
  name: string
  /** Вторая строка мельче первой. */
  note?: string
}

export interface RadarLabelLine {
  text: string
  /** Полный текст усечённой строки — для `<title>`. */
  full?: string
  /** Центр строки по вертикали. */
  y: number
  fontSizePx: number
}

export interface RadarAxisLabel {
  x: number
  anchor: 'start' | 'middle' | 'end'
  lines: RadarLabelLine[]
}

export interface RadarLayoutInput {
  plot: Rect
  angles: readonly number[]
  labels: readonly RadarAxisLabelInput[]
  fontSizePx: number
  noteFontSizePx: number
  /** Зазор между внешним кольцом и подписью. */
  gap: number
  /** Отступ паутины от краёв области — под обводку марки. */
  inset: number
}

export interface RadarLayout {
  cx: number
  cy: number
  radius: number
  labels: RadarAxisLabel[]
}

const LINE_HEIGHT = 1.2
const EDGE = 0.05
/**
 * Нижняя граница радиуса — доля половины меньшей стороны.
 *
 * Подписи уступают паутине, а не наоборот: при отступе под самую длинную
 * подпись с каждой стороны паутина в 213px шириной сжималась до 25px и
 * пропадала под текстом. Ниже этой доли радиус не опускается — подписи
 * усекаются.
 */
const MIN_RADIUS_SHARE = 0.5
/** Подпись шире этой доли области переносится по пробелу на две строки. */
const WRAP_SHARE = 0.25

/**
 * Две строки вместо одной длинной — по пробелу, ближайшему к середине.
 *
 * Перенос дешевле усечения: «System design» двумя строками читается целиком,
 * а одной строкой отнимал у паутины столько же радиуса, сколько занимал.
 */
function wrapName(name: string, fontSizePx: number, limit: number): string[] {
  if (estimateTextWidth(name, fontSizePx) <= limit)
    return [name]

  const middle = name.length / 2
  let best = -1

  for (let index = name.indexOf(' '); index !== -1; index = name.indexOf(' ', index + 1)) {
    if (best === -1 || Math.abs(index - middle) < Math.abs(best - middle))
      best = index
  }

  return best === -1 ? [name] : [name.slice(0, best), name.slice(best + 1)]
}

interface LabelBox {
  anchor: 'start' | 'middle' | 'end'
  lines: Array<{ text: string, fontSizePx: number, height: number, note: boolean }>
  width: number
  /** Ширина второй строки — потолка оси. Её не усекают. */
  noteWidth: number
  height: number
  /** Верх рамки относительно точки якоря. */
  top: number
}

function labelBox(label: RadarAxisLabelInput, angle: number, input: RadarLayoutInput): LabelBox {
  const wrapLimit = input.plot.width * WRAP_SHARE
  const lines = [
    ...wrapName(label.name, input.fontSizePx, wrapLimit)
      .map(text => ({ text, fontSizePx: input.fontSizePx, height: input.fontSizePx * LINE_HEIGHT, note: false })),
    ...(label.note ? [{ text: label.note, fontSizePx: input.noteFontSizePx, height: input.noteFontSizePx * LINE_HEIGHT, note: true }] : []),
  ]
  const height = lines.reduce((sum, line) => sum + line.height, 0)
  const first = lines[0]!.height
  const cos = Math.cos(angle)
  // Верхние подписи растут вверх от якоря, нижние — вниз, боковые — по центру:
  // так вторая строка уходит от паутины, а не на неё.
  const top = cos > 0.5 ? first / 2 - height : cos < -0.5 ? -first / 2 : -height / 2

  return {
    anchor: radarLabelAnchor(angle),
    lines,
    width: Math.max(...lines.map(line => estimateTextWidth(line.text, line.fontSizePx))),
    noteWidth: label.note ? estimateTextWidth(label.note, input.noteFontSizePx) : 0,
    height,
    top,
  }
}

function horizontalExtent(box: LabelBox, width: number): [number, number] {
  if (box.anchor === 'start')
    return [0, width]
  if (box.anchor === 'end')
    return [-width, 0]

  return [-width / 2, width / 2]
}

/**
 * Раскладка паутины: центр, радиус и подписи осей.
 *
 * Радиус — наибольший, при котором каждая подпись со своей оценённой шириной
 * помещается в область построения **с той стороны, куда смотрит её ось**:
 * подпись справа не отнимает места слева. Но не меньше `MIN_RADIUS_SHARE`
 * половины меньшей стороны — дальше уступают подписи: строка, которой не
 * хватило места до края, усекается многоточием, полный текст уходит в `<title>`.
 */
export function radarLayout(input: RadarLayoutInput): RadarLayout {
  const { plot, angles, gap } = input
  const cx = svgCoord(plot.x + plot.width / 2)
  const cy = svgCoord(plot.y + plot.height / 2)
  const right = plot.x + plot.width
  const bottom = plot.y + plot.height
  const ceiling = Math.max(0, Math.min(plot.width, plot.height) / 2 - input.inset)
  const boxes = angles.map((angle, index) => labelBox(input.labels[index] ?? { name: '' }, angle, input))

  /** Наибольший радиус, при котором рамка шириной `width` у каждой оси помещается в область. */
  function fitRadius(widthOf: (box: LabelBox) => number): number {
    let limit = ceiling

    boxes.forEach((box, index) => {
      const angle = angles[index]!
      const sin = Math.sin(angle)
      const cos = Math.cos(angle)
      const [left, rightEdge] = horizontalExtent(box, widthOf(box))

      if (sin > EDGE)
        limit = Math.min(limit, (right - rightEdge - cx) / sin - gap)
      if (sin < -EDGE)
        limit = Math.min(limit, (cx + left - plot.x) / -sin - gap)
      if (cos > EDGE)
        limit = Math.min(limit, (cy + box.top - plot.y) / cos - gap)
      if (cos < -EDGE)
        limit = Math.min(limit, (bottom - cy - box.top - box.height) / -cos - gap)
    })

    return limit
  }

  // Имя оси может уступить — усечься; потолок оси при нормировке — нет: «max 5,…»
  // соврал бы о числе. Поэтому радиус ограничен и снизу долей, и сверху местом
  // под вторую строку.
  const soft = Math.max(fitRadius(box => box.width), ceiling * MIN_RADIUS_SHARE)
  const hard = fitRadius(box => box.noteWidth)
  const radius = Math.max(0, Math.min(ceiling, soft, hard))

  const labels = boxes.map((box, index): RadarAxisLabel => {
    const anchorPoint = polarPoint(cx, cy, radius + gap, angles[index]!)
    const room = box.anchor === 'start'
      ? right - anchorPoint.x
      : box.anchor === 'end'
        ? anchorPoint.x - plot.x
        : 2 * Math.min(anchorPoint.x - plot.x, right - anchorPoint.x)
    let cursor = anchorPoint.y + box.top

    return {
      x: anchorPoint.x,
      anchor: box.anchor,
      lines: box.lines.map((line) => {
        const text = line.note ? line.text : fitLabel(line.text, line.fontSizePx, Math.max(0, room))
        const y = svgCoord(cursor + line.height / 2)

        cursor += line.height

        return { text, full: text === line.text ? undefined : line.text, y, fontSizePx: line.fontSizePx }
      }),
    }
  })

  return { cx, cy, radius: svgCoord(radius), labels }
}
