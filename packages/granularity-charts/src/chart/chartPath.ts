/**
 * Геометрия марок: сегменты, линия, площадь, символы точек, штриховка.
 *
 * `segmentsOf` первичен, `linePath` — адаптер над ним. Это не стиль, а задел:
 * canvas-путь берёт те же сегменты и делает `ctx.lineTo`, не разбирая строку
 * `d` обратно.
 *
 * Между сегментами и разметкой стоит третий вид — **команды рисования**
 * (`curveCommands`). Математика кривой считается ровно один раз, а `linePath` и
 * холст берут из неё числа каждый по-своему: разойтись двум рендерерам просто
 * негде, и это закреплено тестом эквивалентности проекций.
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

/**
 * Команда рисования: числа, а не разметка.
 *
 * Округления здесь нет намеренно — оно нужно только строке `d`, чтобы та была
 * короче и читаемее в diff. Холсту полная точность достаётся даром.
 */
export type DrawCommand
  = | { op: 'move', x: number, y: number }
    | { op: 'line', x: number, y: number }
    | { op: 'cubic', x1: number, y1: number, x2: number, y2: number, x: number, y: number }
    | { op: 'close' }

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
export function areaCommands(
  points: readonly PathPoint[],
  baselineY: number,
  curve: GrChartCurve = 'linear',
): DrawCommand[] {
  return segmentsOf(points).flatMap((segment) => {
    const top = segmentCommands(segment, curve)
    if (top.length === 0)
      return []

    const first = segment[0]!
    const last = segment[segment.length - 1]!

    return [
      ...top,
      { op: 'line', x: last.x, y: baselineY },
      { op: 'line', x: first.x, y: baselineY },
      { op: 'close' },
    ] satisfies DrawCommand[]
  })
}

export function areaPath(
  points: readonly PathPoint[],
  baselineY: number,
  curve: GrChartCurve = 'linear',
): string {
  return commandsToPath(areaCommands(points, baselineY, curve))
}

/**
 * Перемычки через разрывы: отрезки от конца одного куска ряда к началу следующего.
 *
 * Отдельным путём, а не частью линии, и **всегда прямые**, даже когда сама
 * линия сглажена. Иначе перемычка получила бы форму — то есть нарисовала бы
 * ход значения там, где значения не измеряли. Прямой отрезок говорит ровно то,
 * что известно: слева было столько, справа стало столько, а между ними данных
 * нет. Отличать её от настоящей линии — забота компонента (штрих или тень).
 */
export function bridgePath(points: readonly PathPoint[]): string {
  const segments = segmentsOf(points)
  const parts: string[] = []

  for (let index = 1; index < segments.length; index++) {
    const previous = segments[index - 1]!
    const from = previous[previous.length - 1]!
    const to = segments[index]![0]!

    parts.push(`M ${n(from.x)} ${n(from.y)} L ${n(to.x)} ${n(to.y)}`)
  }

  return parts.join(' ')
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
export function bandCommands(
  top: readonly PathPoint[],
  base: readonly PathPoint[],
  curve: GrChartCurve = 'linear',
): DrawCommand[] {
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

  return runs.flatMap((run) => {
    if (run.length < 2)
      return []

    const upper = segmentCommands(run.map(i => ({ x: top[i]!.x, y: top[i]!.y as number })), curve)
    const lower = segmentCommands(run.map(i => ({ x: base[i]!.x, y: base[i]!.y as number })).reverse(), curve)
    if (upper.length === 0 || lower.length === 0)
      return []

    // Низ пришивается к верху линией, а не переносом: `move` разорвал бы контур,
    // и заливка потекла бы по своим правилам заполнения.
    const [head, ...rest] = lower
    const stitched: DrawCommand = head!.op === 'move' ? { op: 'line', x: head!.x, y: head!.y } : head!

    return [...upper, stitched, ...rest, { op: 'close' }] satisfies DrawCommand[]
  })
}

export function bandPath(
  top: readonly PathPoint[],
  base: readonly PathPoint[],
  curve: GrChartCurve = 'linear',
): string {
  return commandsToPath(bandCommands(top, base, curve))
}

function segmentCommands(segment: readonly SolidPoint[], curve: GrChartCurve): DrawCommand[] {
  // Одна точка линией не рисуется: `M` без продолжения не даёт штриха ни в
  // одном рендерере. Её показывает маркер — это забота компонента.
  if (segment.length < 2)
    return []

  const first = segment[0]!

  if (curve === 'step') {
    const commands: DrawCommand[] = [{ op: 'move', x: first.x, y: first.y }]

    for (let i = 1; i < segment.length; i++) {
      const point = segment[i]!
      const previous = segment[i - 1]!

      commands.push({ op: 'line', x: point.x, y: previous.y }, { op: 'line', x: point.x, y: point.y })
    }

    return commands
  }

  if (curve === 'smooth')
    return smoothCommands(segment)

  return [
    { op: 'move', x: first.x, y: first.y },
    ...segment.slice(1).map((p): DrawCommand => ({ op: 'line', x: p.x, y: p.y })),
  ]
}

function segmentPath(segment: readonly SolidPoint[], curve: GrChartCurve): string {
  return commandsToPath(segmentCommands(segment, curve))
}

/** Команды рисования всего ряда: разрывы дают отдельные `move`. */
export function curveCommands(points: readonly PathPoint[], curve: GrChartCurve = 'linear'): DrawCommand[] {
  return segmentsOf(points).flatMap(segment => segmentCommands(segment, curve))
}

/** Команды в строку `d`. Здесь и только здесь координаты округляются. */
export function commandsToPath(commands: readonly DrawCommand[]): string {
  return commands
    .map((command) => {
      if (command.op === 'move')
        return `M ${n(command.x)} ${n(command.y)}`
      if (command.op === 'line')
        return `L ${n(command.x)} ${n(command.y)}`

      if (command.op === 'close')
        return 'Z'

      return `C ${n(command.x1)} ${n(command.y1)} ${n(command.x2)} ${n(command.y2)} ${n(command.x)} ${n(command.y)}`
    })
    .join(' ')
}

/**
 * Монотонная кубика Фритча — Карлсона.
 *
 * Catmull-Rom отклонён: он выбрасывает кривую за диапазон соседних значений,
 * то есть рисует на графике максимум, которого в данных нет. Инвариант
 * монотонности проверяется тестом.
 */
function smoothCommands(segment: readonly SolidPoint[]): DrawCommand[] {
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
  const commands: DrawCommand[] = [{ op: 'move', x: first.x, y: first.y }]

  for (let i = 0; i < count - 1; i++) {
    const from = segment[i]!
    const to = segment[i + 1]!
    const h = (to.x - from.x) / 3

    commands.push({
      op: 'cubic',
      x1: from.x + h,
      y1: from.y + tangents[i]! * h,
      x2: to.x - h,
      y2: to.y - tangents[i + 1]! * h,
      x: to.x,
      y: to.y,
    })
  }

  return commands
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
