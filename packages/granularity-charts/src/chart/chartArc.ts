/**
 * Геометрия долей: раскладка круга, дуги, центроиды, попадание курсора.
 *
 * Модуль чистый — ни Vue, ни DOM. Углы считаются в радианах от **двенадцати
 * часов по часовой стрелке**: так их пишет и читает человек («первая доля идёт
 * от двенадцати»), а перевод в экранные координаты — забота одной функции.
 * Держать их в математической конвенции (от трёх часов против часовой) значило
 * бы разбираться со знаками в каждом вызове.
 */

export interface PieSlice {
  /** Индекс во входном массиве: доля адресуется им, а не порядком после фильтрации. */
  sourceIndex: number
  value: number
  /** Доля от суммы, 0…1. */
  share: number
  startAngle: number
  endAngle: number
}

export interface Point {
  x: number
  y: number
}

const TAU = Math.PI * 2
/** Полный круг одной дугой SVG не рисуется — начало совпало бы с концом. */
const FULL_CIRCLE_EPSILON = 1e-9

/**
 * Раскладка круга по значениям.
 *
 * Отрицательные значения и пропуски отбрасываются, а не берутся по модулю:
 * «минус три» доли круга не бывает, и молча превратить её в плюс — значит
 * нарисовать данные, которых нет. Отброшенное видно по `sourceIndex`: он
 * остаётся индексом входа.
 */
export function pieSlices(
  values: readonly (number | null | undefined)[],
  options: { startAngle?: number } = {},
): PieSlice[] {
  const usable = values
    .map((value, sourceIndex) => ({ value, sourceIndex }))
    .filter((item): item is { value: number, sourceIndex: number } => (
      typeof item.value === 'number' && Number.isFinite(item.value) && item.value > 0
    ))

  const total = usable.reduce((sum, item) => sum + item.value, 0)

  if (total <= 0)
    return []

  let cursor = options.startAngle ?? 0

  return usable.map(({ value, sourceIndex }) => {
    const share = value / total
    const startAngle = cursor

    cursor += share * TAU

    return { sourceIndex, value, share, startAngle, endAngle: cursor }
  })
}

/** Точка на окружности: ноль — вверху, угол растёт по часовой стрелке. */
export function polarPoint(cx: number, cy: number, radius: number, angle: number): Point {
  return {
    x: cx + radius * Math.sin(angle),
    y: cy - radius * Math.cos(angle),
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function arcSegment(cx: number, cy: number, radius: number, from: number, to: number, sweep: 0 | 1): string {
  const end = polarPoint(cx, cy, radius, to)
  const largeArc = Math.abs(to - from) > Math.PI ? 1 : 0

  return `A ${round(radius)} ${round(radius)} 0 ${largeArc} ${sweep} ${round(end.x)} ${round(end.y)}`
}

/**
 * Путь доли: сектор при `innerRadius === 0`, кольцо иначе.
 *
 * Полный круг рисуется **двумя** дугами: у дуги в 360° начало и конец совпадают,
 * и рендерер не рисует ничего вовсе — классическая ловушка круговых диаграмм с
 * единственной долей.
 */
export function arcPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweepAngle = endAngle - startAngle

  if (!(sweepAngle > 0) || !(outerRadius > 0))
    return ''

  const isFullCircle = sweepAngle >= TAU - FULL_CIRCLE_EPSILON
  const middle = startAngle + sweepAngle / 2
  const outerStart = polarPoint(cx, cy, outerRadius, startAngle)

  if (isFullCircle) {
    const outerRing = [
      `M ${round(outerStart.x)} ${round(outerStart.y)}`,
      arcSegment(cx, cy, outerRadius, startAngle, middle, 1),
      arcSegment(cx, cy, outerRadius, middle, startAngle + TAU, 1),
      'Z',
    ]

    if (innerRadius <= 0)
      return outerRing.join(' ')

    const innerStart = polarPoint(cx, cy, innerRadius, startAngle)

    // Внутренний круг обходится в обратную сторону: правило чётности заливки
    // делает из двух окружностей кольцо, а не диск поверх диска.
    return [
      ...outerRing.slice(0, -1),
      'Z',
      `M ${round(innerStart.x)} ${round(innerStart.y)}`,
      arcSegment(cx, cy, innerRadius, startAngle, middle, 0),
      arcSegment(cx, cy, innerRadius, middle, startAngle + TAU, 0),
      'Z',
    ].join(' ')
  }

  const parts = [`M ${round(outerStart.x)} ${round(outerStart.y)}`, arcSegment(cx, cy, outerRadius, startAngle, endAngle, 1)]

  if (innerRadius > 0) {
    const innerEnd = polarPoint(cx, cy, innerRadius, endAngle)

    parts.push(`L ${round(innerEnd.x)} ${round(innerEnd.y)}`, arcSegment(cx, cy, innerRadius, endAngle, startAngle, 0))
  }
  else {
    parts.push(`L ${round(cx)} ${round(cy)}`)
  }

  parts.push('Z')

  return parts.join(' ')
}

/** Середина доли по радиусу и по углу — туда садится подпись. */
export function arcCentroid(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): Point {
  return polarPoint(cx, cy, (outerRadius + innerRadius) / 2, (startAngle + endAngle) / 2)
}

/** Угол точки относительно центра, нормализованный в `[0, 2π)` от двенадцати часов. */
export function angleOfPoint(cx: number, cy: number, x: number, y: number): number {
  const angle = Math.atan2(x - cx, cy - y)

  return (angle + TAU) % TAU
}

/**
 * Доля под курсором.
 *
 * Хит-тест у круга **угловой**, а не по абсциссе: `nearestIndex` декартовой
 * рамы здесь ответил бы неверно всегда, кроме случайных совпадений. Точка вне
 * кольца — не попадание: у бублика середина пустая, и «ближайшая доля» там
 * означала бы выбор наугад.
 */
export function sliceAtPoint(
  slices: readonly PieSlice[],
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  x: number,
  y: number,
): number {
  const distance = Math.hypot(x - cx, y - cy)

  if (distance > outerRadius || distance < innerRadius)
    return -1

  const angle = angleOfPoint(cx, cy, x, y)

  return slices.findIndex((slice) => {
    const start = slice.startAngle % TAU
    const end = start + (slice.endAngle - slice.startAngle)

    // Доля, перешагнувшая через двенадцать часов, проверяется двумя отрезками.
    return end <= TAU
      ? angle >= start && angle < end
      : angle >= start || angle < end - TAU
  })
}
