import type { ChartData, NormalizedPoint, NormalizedSeries } from './chartModel'
import { indexByX } from './chartModel'
import type { GrChartScaleKind } from './chartScale'

/**
 * Прореживание ряда методом LTTB (Largest Triangle Three Buckets).
 *
 * Модуль чистый — ни Vue, ни DOM. Результат — **проекция для рисования**, а не
 * этап модели: прорежённые точки идут только в строку `d`, тогда как курсор,
 * клавиатура, тултип и скрытая таблица продолжают работать с полным рядом.
 * Ровно на это заведён `NormalizedPoint.sourceIndex`.
 *
 * **Почему LTTB, а не огибающая min/max.** LTTB сохраняет форму тренда и
 * одиночные выбросы, отбирая настоящие точки ряда; огибающая честнее к шуму, но
 * рисует конверт, а не линию, и на ней нельзя стоять курсором. Огибающая
 * просится вторым режимом — union расширяется без слома.
 *
 * **Про нормировку осей — без преувеличений.** Обе координаты делятся на размах
 * ряда, но на *порядок* сравнения внутри корзины это не влияет: делители входят
 * в площадь общим множителем и сокращаются. Нормировка нужна против потери
 * точности: на оси времени абсциссы порядка 1e12, и разность двух соседних
 * миллисекунд в произведении с малым значением уже съедается мантиссой double.
 * Проверить это тестом на обычных данных нельзя — выбор точек там совпадает с
 * нормировкой и без неё, что и подтвердилось при попытке.
 */

/** Точек на пиксель ширины: тоньше двух вершин на пиксель SVG всё равно не покажет. */
const POINTS_PER_PX = 2
/** Ниже этого бюджета узкая колонка схлопнула бы ряд в несколько точек. */
const MIN_BUDGET = 64
/** Ширина квантуется, иначе путь дёргается на каждом пикселе ресайза. */
const WIDTH_QUANTUM = 32

export interface DecimateOptions {
  maxPoints: number
  /** Размах X. Не задан — считается по ряду. */
  xSpan?: number
  /** Размах Y. Не задан — считается по ряду. */
  ySpan?: number
}

export interface DecimationBudgetInput {
  mode: 'auto' | 'always' | 'never'
  kind: GrChartScaleKind
  /** Ширина области построения. `0` (SSR, скрытая вкладка) — не прореживать. */
  plotWidth: number
  maxPoints?: number
  /** Сколько точек в самой длинной серии. */
  total: number
}

/**
 * Бюджет точек или `null` — «не прореживать».
 *
 * Гард категориальной шкалы живёт здесь, а не в компоненте: домен такой оси —
 * это `[0, n−1]`, деления рисуются от числа категорий, и выброшенная точка
 * оставила бы на оси подпись, под которой ничего нет. В компоненте про это
 * забыли бы на третьем вызове.
 */
export function decimationBudget(input: DecimationBudgetInput): number | null {
  if (input.mode === 'never') return null
  if (input.kind === 'band') return null

  const budget = input.maxPoints ?? budgetForWidth(input.plotWidth)

  if (budget === null || budget < 3) return null
  if (input.mode === 'auto' && input.total <= budget) return null

  return budget
}

function budgetForWidth(plotWidth: number): number | null {
  if (!(plotWidth > 0)) return null

  const quantized = Math.max(WIDTH_QUANTUM, Math.round(plotWidth / WIDTH_QUANTUM) * WIDTH_QUANTUM)

  return Math.max(MIN_BUDGET, quantized * POINTS_PER_PX)
}

function spanOf(values: readonly number[]): number {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  for (const value of values) {
    if (value < min) min = value
    if (value > max) max = value
  }

  const span = max - min

  return Number.isFinite(span) && span > 0 ? span : 1
}

/**
 * Индексы остающихся точек внутри сплошного куска.
 *
 * Возвращаются возрастающими и всегда содержат первую и последнюю: концы ряда
 * держат его границы, и потеряв их, линия укоротилась бы на глазах.
 */
export function lttbIndices(points: readonly NormalizedPoint[], options: DecimateOptions): number[] {
  const total = points.length
  const budget = Math.floor(options.maxPoints)

  if (total <= budget || budget < 3)
    return points.map((_, index) => index)

  const xSpan = options.xSpan ?? spanOf(points.map(point => point.x))
  const ySpan = options.ySpan ?? spanOf(points.map(point => point.y ?? 0))
  const nx = (value: number): number => value / xSpan
  const ny = (value: number): number => value / ySpan

  const result: number[] = [0]
  const every = (total - 2) / (budget - 2)
  let anchor = 0

  for (let bucket = 0; bucket < budget - 2; bucket += 1) {
    // Последняя точка ряда добавляется отдельно, поэтому корзины её не трогают:
    // иначе на коротком бюджете она попала бы в результат дважды.
    const rangeStart = Math.min(Math.floor((bucket + 1) * every) + 1, total - 2)
    const rangeEnd = Math.min(Math.floor((bucket + 2) * every) + 1, total - 1)
    const nextStart = rangeEnd
    const nextEnd = Math.min(Math.floor((bucket + 3) * every) + 1, total)

    // Средняя точка следующей корзины — третья вершина треугольника.
    let avgX = 0
    let avgY = 0
    let count = 0

    for (let i = nextStart; i < nextEnd; i += 1) {
      avgX += nx(points[i]!.x)
      avgY += ny(points[i]!.y ?? 0)
      count += 1
    }

    if (count > 0) {
      avgX /= count
      avgY /= count
    }

    const ax = nx(points[anchor]!.x)
    const ay = ny(points[anchor]!.y ?? 0)

    let best = rangeStart
    let bestArea = -1

    for (let i = rangeStart; i < rangeEnd; i += 1) {
      const area = Math.abs(
        (ax - avgX) * (ny(points[i]!.y ?? 0) - ay) - (ax - nx(points[i]!.x)) * (avgY - ay),
      )

      if (area > bestArea) {
        bestArea = area
        best = i
      }
    }

    result.push(best)
    anchor = best
  }

  if (result.at(-1) !== total - 1)
    result.push(total - 1)

  return result
}

/**
 * Точки для рисунка.
 *
 * Возвращает **те же объекты по ссылке**: `sourceIndex`, `raw`, `label` и
 * границы стека доезжают сами, а «ведёт к исходной точке» проверяется через
 * сравнение ссылок, а не полей. Если прореживать нечего — тот же массив.
 */
export function decimatePoints(
  points: readonly NormalizedPoint[],
  options: DecimateOptions,
): readonly NormalizedPoint[] {
  if (points.length <= options.maxPoints)
    return points

  // Ряд режется на сплошные куски тем же правилом, что `segmentsOf`: разрыв
  // обязан пережить прореживание, иначе линия соединится через пропуск.
  const chunks: { start: number, points: NormalizedPoint[] }[] = []
  let current: NormalizedPoint[] = []
  let start = 0
  const gaps: NormalizedPoint[] = []

  points.forEach((point, index) => {
    if (point.y === null || !Number.isFinite(point.y)) {
      if (current.length > 0) {
        chunks.push({ start, points: current })
        current = []
      }
      // Один разделитель на пропуск: разрыв показывается, длина его не важна.
      if (gaps.length === 0 || gaps.at(-1) !== point)
        gaps.push(point)

      return
    }

    if (current.length === 0) start = index
    current.push(point)
  })

  if (current.length > 0)
    chunks.push({ start, points: current })

  const solid = chunks.reduce((sum, chunk) => sum + chunk.points.length, 0)

  if (solid === 0)
    return points

  const xSpan = spanOf(points.map(point => point.x))
  const ySpan = spanOf(points.filter(point => point.y !== null).map(point => point.y!))
  const out: NormalizedPoint[] = []
  let gapIndex = 0

  chunks.forEach((chunk, order) => {
    // Бюджет делится пропорционально длине куска: короткий кусок не должен
    // получить столько же вершин, сколько длинный.
    const share = Math.max(3, Math.round((chunk.points.length / solid) * options.maxPoints))
    const kept = lttbIndices(chunk.points, { maxPoints: share, xSpan, ySpan })

    if (order > 0 && gaps[gapIndex] !== undefined) {
      out.push(gaps[gapIndex]!)
      gapIndex += 1
    }

    for (const index of kept)
      out.push(chunk.points[index]!)
  })

  return out
}

/** Серия для рисунка. Та же ссылка, когда прореживать нечего. */
export function decimateSeries(series: NormalizedSeries, options: DecimateOptions): NormalizedSeries {
  return withPoints(series, decimatePoints(series.points, options))
}

/**
 * Серия с другим набором точек и **своим** индексом.
 *
 * `byX` обязан описывать те точки, что лежат в `points`: разойдись они, и
 * таблица, построенная по прорежённому ряду, спрашивала бы индекс полного.
 */
function withPoints(series: NormalizedSeries, points: readonly NormalizedPoint[]): NormalizedSeries {
  return points === series.points ? series : { ...series, points, byX: indexByX(points) }
}

export interface DecimateGroupOptions extends DecimateOptions {
  /**
   * Общий набор абсцисс на всю группу.
   *
   * Обязателен для стека: независимо прорежённые серии выбрали бы разные
   * абсциссы, и полосы разошлись бы швами — низ верхней интерполировался бы по
   * одним точкам, верх нижней по другим.
   */
  sharedX?: boolean
}

export function decimateSeriesGroup(
  series: readonly NormalizedSeries[],
  options: DecimateGroupOptions,
): readonly NormalizedSeries[] {
  if (series.length === 0)
    return series

  if (!options.sharedX)
    return series.map(item => decimateSeries(item, options))

  // Пилот — самая длинная серия: по ней выбирается набор абсцисс, который затем
  // применяется ко всем. Свои концы каждая серия сохраняет, чтобы не укоротиться.
  const pilot = series.reduce((longest, item) => (item.points.length > longest.points.length ? item : longest), series[0]!)
  const kept = decimatePoints(pilot.points, options)

  if (kept === pilot.points)
    return series

  const allowed = new Set(kept.map(point => point.x))

  return series.map((item) => {
    const first = item.points[0]
    const last = item.points.at(-1)
    const points = item.points.filter((point, index) => (
      allowed.has(point.x)
      || point === first
      || point === last
      || index === 0
    ))

    return withPoints(item, points.length === item.points.length ? item.points : points)
  })
}

/**
 * Ряд, прорежённый до бюджета целиком — вместе с позициями.
 *
 * Нужен скрытой таблице: она строится из `ChartData`, а не из серий, и её
 * строки идут по `positions`. Набор абсцисс общий на группу — иначе у серий
 * разошлись бы строки и в таблице появились бы дыры там, где данные есть.
 */
export function decimateChartData(data: ChartData, maxPoints: number): ChartData {
  const visible = data.series.filter(series => !series.hidden)
  const decimated = decimateSeriesGroup(visible, { maxPoints, sharedX: true })

  if (decimated === visible)
    return data

  const byId = new Map(decimated.map(series => [series.id, series]))
  const positions = new Set<number>()

  for (const series of decimated) {
    for (const point of series.points)
      positions.add(point.x)
  }

  return {
    ...data,
    series: data.series.map(series => byId.get(series.id) ?? series),
    positions: [...positions].sort((a, b) => a - b),
  }
}
