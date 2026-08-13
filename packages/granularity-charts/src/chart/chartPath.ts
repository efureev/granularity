/**
 * Геометрия марок: сегменты, линия, площадь, символы точек, штриховка.
 *
 * `segmentsOf` первичен, `linePath` — адаптер над ним. Это не стиль, а задел:
 * canvas-путь возьмёт те же сегменты и сделает `ctx.lineTo`, не разбирая
 * строку `d` обратно.
 */

export type GrChartCurve = 'linear' | 'smooth' | 'step'

export const GR_CHART_SHAPES = ['circle', 'square', 'triangle', 'diamond', 'cross'] as const
export type GrChartPointShape = typeof GR_CHART_SHAPES[number]

export const GR_CHART_DASHES = ['none', 'dash', 'dot', 'dash-dot', 'long-dash'] as const
export type GrChartDashPattern = typeof GR_CHART_DASHES[number]

export interface PathPoint {
  x: number
  y: number | null
}

interface SolidPoint {
  x: number
  y: number
}

/** Координаты в `d` округляются: строка короче, а diff снимка читаем. */
function n(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Непрерывные куски ряда: `null` рвёт линию.
 *
 * Пропуск в данных — не ноль и не «соединить по прямой»: и то и другое рисует
 * значение, которого не было.
 */
export function segmentsOf(points: readonly PathPoint[]): SolidPoint[][] {
  const segments: SolidPoint[][] = []
  let current: SolidPoint[] = []

  for (const point of points) {
    if (point.y === null || !Number.isFinite(point.y)) {
      if (current.length > 0) {
        segments.push(current)
        current = []
      }
      continue
    }

    current.push({ x: point.x, y: point.y })
  }

  if (current.length > 0)
    segments.push(current)

  return segments
}

export function linePath(points: readonly PathPoint[], curve: GrChartCurve = 'linear'): string {
  return segmentsOf(points)
    .map(segment => segmentPath(segment, curve))
    .filter(Boolean)
    .join(' ')
}

/**
 * Площадь под линией.
 *
 * Каждый сегмент замыкается **сам по себе**: одна общая заливка на весь ряд
 * закрасила бы и разрывы, то есть показала бы данные там, где их нет.
 */
export function areaPath(
  points: readonly PathPoint[],
  baselineY: number,
  curve: GrChartCurve = 'linear',
): string {
  return segmentsOf(points)
    .map((segment) => {
      const top = segmentPath(segment, curve)

      if (!top)
        return ''

      const first = segment[0]!
      const last = segment[segment.length - 1]!

      return `${top} L ${n(last.x)} ${n(baselineY)} L ${n(first.x)} ${n(baselineY)} Z`
    })
    .filter(Boolean)
    .join(' ')
}

/**
 * Полоса между двумя кривыми — тело стека.
 *
 * От `areaPath` отличается тем, что низ полосы не прямая, а такая же кривая:
 * в стеке каждая серия лежит на сумме предыдущих. Разрыв берётся по **обеим**
 * границам сразу: полоса, у которой известен только верх, — это не полоса.
 *
 * Нижняя граница обходится в обратном порядке, а её `M` подменяется на `L`:
 * иначе получился бы второй подпуть, и заливка вышла бы двумя лентами вместо
 * одной замкнутой фигуры.
 */
export function bandPath(
  top: readonly PathPoint[],
  base: readonly PathPoint[],
  curve: GrChartCurve = 'linear',
): string {
  const runs: number[][] = []
  let current: number[] = []

  for (let i = 0; i < top.length; i++) {
    const upper = top[i]
    const lower = base[i]
    const solid = upper !== undefined && lower !== undefined
      && upper.y !== null && lower.y !== null
      && Number.isFinite(upper.y) && Number.isFinite(lower.y)

    if (solid) {
      current.push(i)
      continue
    }

    if (current.length > 0) {
      runs.push(current)
      current = []
    }
  }

  if (current.length > 0)
    runs.push(current)

  return runs
    .map((run) => {
      if (run.length < 2)
        return ''

      const upper = segmentPath(run.map(i => ({ x: top[i]!.x, y: top[i]!.y as number })), curve)
      const lower = segmentPath(run.map(i => ({ x: base[i]!.x, y: base[i]!.y as number })).reverse(), curve)

      return upper && lower ? `${upper} L${lower.slice(1)} Z` : ''
    })
    .filter(Boolean)
    .join(' ')
}

function segmentPath(segment: readonly SolidPoint[], curve: GrChartCurve): string {
  if (segment.length === 0)
    return ''

  const first = segment[0]!

  // Одна точка линией не рисуется: `M` без продолжения не даёт штриха ни в
  // одном рендерере. Её показывает маркер — это забота компонента.
  if (segment.length === 1)
    return ''

  if (curve === 'step') {
    const parts = [`M ${n(first.x)} ${n(first.y)}`]

    for (let i = 1; i < segment.length; i++) {
      const point = segment[i]!
      const previous = segment[i - 1]!

      parts.push(`L ${n(point.x)} ${n(previous.y)}`, `L ${n(point.x)} ${n(point.y)}`)
    }

    return parts.join(' ')
  }

  if (curve === 'smooth')
    return smoothPath(segment)

  return [`M ${n(first.x)} ${n(first.y)}`, ...segment.slice(1).map(p => `L ${n(p.x)} ${n(p.y)}`)].join(' ')
}

/**
 * Монотонная кубика Фритча — Карлсона.
 *
 * Catmull-Rom отклонён: он выбрасывает кривую за диапазон соседних значений,
 * то есть рисует на графике максимум, которого в данных нет. Инвариант
 * монотонности проверяется тестом.
 */
function smoothPath(segment: readonly SolidPoint[]): string {
  const count = segment.length
  const slopes: number[] = []

  for (let i = 0; i < count - 1; i++) {
    const dx = segment[i + 1]!.x - segment[i]!.x

    slopes.push(dx === 0 ? 0 : (segment[i + 1]!.y - segment[i]!.y) / dx)
  }

  const tangents: number[] = Array.from({ length: count }, (_, i) => {
    if (i === 0)
      return slopes[0] ?? 0
    if (i === count - 1)
      return slopes[count - 2] ?? 0

    return ((slopes[i - 1] ?? 0) + (slopes[i] ?? 0)) / 2
  })

  for (let i = 0; i < count - 1; i++) {
    const slope = slopes[i]!

    if (slope === 0) {
      tangents[i] = 0
      tangents[i + 1] = 0
      continue
    }

    const a = tangents[i]! / slope
    const b = tangents[i + 1]! / slope
    const magnitude = a * a + b * b

    if (magnitude > 9) {
      const scale = 3 / Math.sqrt(magnitude)

      tangents[i] = scale * a * slope
      tangents[i + 1] = scale * b * slope
    }
  }

  const first = segment[0]!
  const parts = [`M ${n(first.x)} ${n(first.y)}`]

  for (let i = 0; i < count - 1; i++) {
    const from = segment[i]!
    const to = segment[i + 1]!
    const h = (to.x - from.x) / 3

    parts.push(
      `C ${n(from.x + h)} ${n(from.y + tangents[i]! * h)}`
      + ` ${n(to.x - h)} ${n(to.y - tangents[i + 1]! * h)}`
      + ` ${n(to.x)} ${n(to.y)}`,
    )
  }

  return parts.join(' ')
}

/**
 * Символ точки. `size` — полная ширина марки.
 *
 * Форма — второй различитель серии помимо цвета, поэтому набор фиксирован и
 * различим на глаз при радиусе в три-четыре пикселя.
 */
export function symbolPath(shape: GrChartPointShape, cx: number, cy: number, size: number): string {
  const r = size / 2

  switch (shape) {
    case 'square':
      return `M ${n(cx - r)} ${n(cy - r)} h ${n(size)} v ${n(size)} h ${n(-size)} Z`
    case 'triangle':
      return `M ${n(cx)} ${n(cy - r)} L ${n(cx + r)} ${n(cy + r)} L ${n(cx - r)} ${n(cy + r)} Z`
    case 'diamond':
      return `M ${n(cx)} ${n(cy - r)} L ${n(cx + r)} ${n(cy)} L ${n(cx)} ${n(cy + r)} L ${n(cx - r)} ${n(cy)} Z`
    case 'cross': {
      const t = r / 2.4

      return [
        `M ${n(cx - t)} ${n(cy - r)}`,
        `L ${n(cx + t)} ${n(cy - r)}`,
        `L ${n(cx + t)} ${n(cy - t)}`,
        `L ${n(cx + r)} ${n(cy - t)}`,
        `L ${n(cx + r)} ${n(cy + t)}`,
        `L ${n(cx + t)} ${n(cy + t)}`,
        `L ${n(cx + t)} ${n(cy + r)}`,
        `L ${n(cx - t)} ${n(cy + r)}`,
        `L ${n(cx - t)} ${n(cy + t)}`,
        `L ${n(cx - r)} ${n(cy + t)}`,
        `L ${n(cx - r)} ${n(cy - t)}`,
        `L ${n(cx - t)} ${n(cy - t)}`,
        'Z',
      ].join(' ')
    }
    case 'circle':
    default:
      // Двумя дугами, а не `<circle>`: символ обязан быть один `d`, иначе
      // легенда и точка рисовались бы разными элементами.
      return `M ${n(cx - r)} ${n(cy)} a ${n(r)} ${n(r)} 0 1 0 ${n(size)} 0 a ${n(r)} ${n(r)} 0 1 0 ${n(-size)} 0 Z`
  }
}

/**
 * `stroke-dasharray` для штриховки серии.
 *
 * Считается от толщины линии: на тонкой линии длинный штрих читается как
 * сплошная, а на толстой мелкая точка сливается.
 */
export function dashArrayFor(dash: GrChartDashPattern, strokeWidth: number): string | undefined {
  const w = Math.max(0.5, strokeWidth)

  switch (dash) {
    case 'dash': return `${n(w * 4)} ${n(w * 3)}`
    case 'dot': return `${n(w)} ${n(w * 2)}`
    case 'dash-dot': return `${n(w * 5)} ${n(w * 2)} ${n(w)} ${n(w * 2)}`
    case 'long-dash': return `${n(w * 9)} ${n(w * 3)}`
    case 'none':
    default: return undefined
  }
}
