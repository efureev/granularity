import type { Rect } from './chartLayout'

/**
 * Теплокарта: матрица значений, шкала цвета и сетка ячеек.
 *
 * Шкала здесь непрерывная или ступенчатая, но всегда **одна роль темы**, а не
 * набор из пяти цветов: пять цветов пришлось бы подбирать заново под тёмную
 * тему и заново же — под вторую теплокарту. `color-mix` по роли меняется вместе
 * с темой сам.
 *
 * `null` — не ноль и не минимум шкалы: ячейки нет. Для матрицы удержания это
 * принципиально — «месяц ещё не наступил» и «удержание 0 %» разные утверждения.
 */

export type HeatmapScaleKind = 'sequential' | 'diverging'

export interface HeatmapScaleOptions {
  /** Границы шкалы. Не заданы — считаются по данным. */
  domain?: readonly [number, number]
  kind?: HeatmapScaleKind
  /** Середина расходящейся шкалы. */
  midpoint?: number
  /** Число ступеней; `0` — непрерывная. */
  steps?: number
}

export interface HeatmapScale {
  kind: HeatmapScaleKind
  domain: readonly [number, number]
  midpoint: number
  steps: number
  /**
   * Доля значения на шкале. Последовательная — `0…1`, расходящаяся — `−1…1`,
   * где знак это сторона от середины. `null` — ячейки нет.
   */
  fractionOf: (value: number | null) => number | null
  /** Границы ступеней в значениях: из них строится легенда. */
  thresholds: number[]
}

export interface HeatmapRoles {
  low: string
  high: string
  mid: string
  empty: string
}

export interface HeatmapCell {
  x: number
  y: number
  value: number | null
  fraction: number | null
  rect: Rect
}

export interface HeatmapGrid {
  plot: Rect
  columns: number
  rows: number
  gap?: number
}

/**
 * Наименьшая доля краски у ненулевого значения.
 *
 * Без неё настоящий минимум шкалы получил бы нулевую примесь и стал бы
 * неотличим от ячейки, которой нет вовсе, — а это разные утверждения.
 */
const MIN_MIX = 0.12

/** Выше этой доли примеси заливка темнее подписи: подпись обязана посветлеть. */
const DARK_AT = 0.62

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function finiteOrNull(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/**
 * Разреженные строки дополняются `null` справа, а не нулями.
 *
 * Матрица когорт разрежена по построению: у свежей когорты будущих месяцев ещё
 * нет. Дополнить их нулями значило бы объявить полное вымывание.
 */
export function heatmapMatrix(
  values: readonly (readonly (number | null)[])[],
  columns: number,
  rows: number,
): (number | null)[][] {
  return Array.from({ length: Math.max(0, rows) }, (_, y) => {
    const row = values[y] ?? []

    return Array.from({ length: Math.max(0, columns) }, (_, x) => finiteOrNull(row[x]))
  })
}

export function heatmapScale(
  values: readonly (readonly (number | null)[])[],
  options: HeatmapScaleOptions = {},
): HeatmapScale {
  const kind = options.kind ?? 'sequential'
  const midpoint = options.midpoint ?? 0
  const steps = Math.max(0, Math.floor(options.steps ?? 5))

  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  let seen = false

  for (const row of values) {
    for (const value of row) {
      // Отсутствующая ячейка в домен не входит: иначе «ещё не наступило»
      // растянуло бы шкалу к нулю и перекрасило всю карту.
      if (finiteOrNull(value) === null)
        continue

      seen = true
      min = Math.min(min, value as number)
      max = Math.max(max, value as number)
    }
  }

  const domain = options.domain ?? (seen ? [min, max] as const : [0, 1] as const)
  const [low, high] = domain[0] <= domain[1] ? domain : [domain[1], domain[0]]

  /** Все значения равны — делить не на что; половина шкалы честнее нуля и единицы. */
  const span = high - low
  const spread = Math.max(Math.abs(low - midpoint), Math.abs(high - midpoint))

  function quantize(fraction: number): number {
    if (steps <= 1)
      return fraction

    const sign = fraction < 0 ? -1 : 1
    const magnitude = Math.abs(fraction)

    return sign * (Math.min(steps - 1, Math.floor(magnitude * steps)) / (steps - 1))
  }

  function fractionOf(value: number | null): number | null {
    const numeric = finiteOrNull(value)

    if (numeric === null)
      return null

    if (kind === 'diverging') {
      // Нормировка на **больший** из отступов делает шкалу симметричной
      // относительно середины по построению, а не по совпадению данных.
      const fraction = spread > 0 ? clamp((numeric - midpoint) / spread, -1, 1) : 0

      return quantize(fraction)
    }

    return quantize(span > 0 ? clamp((numeric - low) / span, 0, 1) : 0.5)
  }

  const thresholdCount = steps > 0 ? steps : 1
  const thresholds = Array.from({ length: thresholdCount + 1 }, (_, index) => low + (span * index) / thresholdCount)

  return { kind, domain: [low, high], midpoint, steps, fractionOf, thresholds }
}

/**
 * Цвет ячейки — примесь роли к прозрачному, а не палитра из пяти цветов.
 *
 * Отсутствующая ячейка не заливается вовсе: за ней остаётся фон карты.
 */
export function heatmapColor(
  fraction: number | null,
  roles: HeatmapRoles,
  kind: HeatmapScaleKind = 'sequential',
): string {
  if (fraction === null)
    return roles.empty

  const magnitude = Math.abs(fraction)
  const share = Math.round((MIN_MIX + (1 - MIN_MIX) * magnitude) * 100)

  if (kind === 'diverging') {
    // Ровно на середине краски нет: расходящаяся шкала показывает отклонение, а
    // на середине его нет ни в одну сторону.
    if (magnitude === 0)
      return roles.mid

    return `color-mix(in oklab, ${fraction < 0 ? roles.low : roles.high} ${share}%, transparent)`
  }

  return `color-mix(in oklab, ${roles.high} ${share}%, transparent)`
}

/**
 * Нужна ли светлая подпись в ячейке.
 *
 * Считается от **доли**, а не от итогового цвета: без DOM цвет не измерить, а
 * `color-mix` браузер разрешает уже после рендера.
 */
export function heatmapOnDark(fraction: number | null): boolean {
  return fraction !== null && Math.abs(fraction) >= DARK_AT
}

/**
 * Сетка ячеек равного размера.
 *
 * Неравномерной сетки у теплокарты нет: ячейка одного размера — это её
 * контракт, иначе площадь начинает кодировать второй показатель, о котором
 * читателю не сказали.
 */
export function heatmapCells(
  matrix: readonly (readonly (number | null)[])[],
  scale: HeatmapScale,
  grid: HeatmapGrid,
): HeatmapCell[] {
  const { plot, columns, rows } = grid

  if (columns <= 0 || rows <= 0)
    return []

  const gap = Math.max(0, grid.gap ?? 0)
  const stepX = plot.width / columns
  const stepY = plot.height / rows
  const cells: HeatmapCell[] = []

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const value = finiteOrNull(matrix[y]?.[x])

      cells.push({
        x,
        y,
        value,
        fraction: scale.fractionOf(value),
        rect: {
          x: plot.x + stepX * x + gap / 2,
          y: plot.y + stepY * y + gap / 2,
          // Зазор съедается изнутри ячейки: сетка иначе перестала бы упираться
          // в края области, и последняя колонка оказалась бы уже остальных.
          width: Math.max(0, stepX - gap),
          height: Math.max(0, stepY - gap),
        },
      })
    }
  }

  return cells
}
