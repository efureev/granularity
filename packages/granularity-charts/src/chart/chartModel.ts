import type { GrChartScaleKind } from './chartScale'
import type { GrChartDashPattern, GrChartPointShape } from './chartPath'
import { type GrChartSeriesStyle, seriesStyle } from './chartSeriesStyle'

/**
 * Разбор входа в один внутренний вид.
 *
 * Наружу пакет принимает два вида данных, внутрь пропускает один. Объектная
 * форма — то, что приходит от бэкенда после `map`; колоночная не создаёт
 * объект на точку и переживает десятки тысяч значений без давления на GC.
 * Перепаковывать данные силами потребителя дороже, чем разобрать их здесь.
 */

export type GrChartXValue = number | string | Date

export interface GrChartPoint {
  x: GrChartXValue
  /** `null` — пропуск: линия рвётся, точка не рисуется, в таблице «—». */
  y: number | null
  /** Подпись точки. Не задана — собирается из `x`. */
  label?: string
  meta?: unknown
}

export interface GrChartSeries {
  id: string
  label?: string
  /** Удобный вход. Взаимоисключим с парой `x`/`y`. */
  data?: readonly GrChartPoint[]
  /** Быстрый вход: колонки переиспользуются между кадрами. */
  x?: readonly GrChartXValue[]
  y?: readonly (number | null)[]
  color?: string
  /** Цвет заливки, если он должен отличаться от линии. Читает его только площадь. */
  fillColor?: string
  shape?: GrChartPointShape
  dash?: GrChartDashPattern
  hidden?: boolean
  /**
   * К какой оси значений привязана серия. Дефолт — левая.
   *
   * Без `dualAxis` поле **игнорируется**, и это осознанно: две оси позволяют
   * подогнать любые два ряда под видимую корреляцию, поэтому вторая ось должна
   * быть решением автора графика, а не побочным эффектом поля в данных.
   */
  axis?: 'left' | 'right'
}

export interface NormalizedPoint {
  /** Уже число: время → epoch ms, категория → индекс. Шкалы знают только числа. */
  x: number
  y: number | null
  /**
   * Индекс во входном массиве серии.
   *
   * Обратный адрес: по нему тултип, скрытая таблица и будущая децимация
   * находят исходную точку после сортировки и прореживания.
   */
  sourceIndex: number
  raw: GrChartXValue
  label?: string
  /**
   * Границы полосы стека: низ — сумма предыдущих серий, верх — плюс своё
   * значение. Заданы только при `stacked`.
   *
   * Собственное `y` при этом **не трогается**. Тултип, скрытая таблица и живой
   * регион обязаны говорить «продажи — сорок», а не «продажи — сто двадцать,
   * потому что снизу лежат ещё две серии».
   */
  stackBase?: number
  stackTop?: number
}

export interface NormalizedSeries {
  id: string
  label: string
  colorIndex: number
  style: GrChartSeriesStyle
  hidden: boolean
  /** Задана всегда: без `dualAxis` нормализация ставит всем сериям левую. */
  axis: 'left' | 'right'
  points: readonly NormalizedPoint[]
}

export interface ChartData {
  kind: GrChartScaleKind
  series: readonly NormalizedSeries[]
  /** Порядок оси у `band`; у остальных шкал пуст. */
  categories: readonly string[]
  xDomain: readonly [number, number]
  yDomain: readonly [number, number]
  /**
   * Домен правой оси. `undefined` — ось одна, и всё, что её касается, спит:
   * раскладка не резервирует место справа, `yScaleRight` равен `null`, у колонок
   * таблицы нет пометки об оси.
   */
  yDomainRight?: readonly [number, number]
  /** Объединённые x видимых серий по возрастанию — по ним ходят курсор и клавиатура. */
  positions: readonly number[]
}

export interface NormalizeOptions {
  kind?: GrChartScaleKind
  /** Сортировать по `x`. Дефолт — да; для `band` игнорируется. */
  sort?: boolean
  includeZero?: boolean
  /** Границы оси значений; `null` в любой позиции — считать эту сторону. */
  yDomain?: readonly [number | null, number | null]
  /**
   * Складывать серии по позиции: каждая полоса ложится на сумму предыдущих.
   * `'100%'` вдобавок нормирует столбец к единице — тогда ось показывает доли,
   * а не величины.
   */
  stacked?: boolean | '100%'
  /**
   * Значения, которые домен обязан вместить помимо данных: порог опоры,
   * основание и вершина шага моста.
   *
   * Складываются с размахом данных **до** `padDomain`, поэтому `includeZero` и
   * отступы применяются к объединению, а не к данным отдельно. Модель при этом
   * не знает ни про опоры, ни про мост: закрепить значение на оси — это её
   * работа, а что оно означает — уже нет.
   *
   * У категориальной оси закреплять нечего: её домен это `[0, n−1]`, и
   * `includeXValues` там игнорируется.
   */
  includeXValues?: readonly number[]
  includeYValues?: readonly number[]
  /**
   * Разнести серии по двум осям значений.
   *
   * Без него `axis` у серии игнорируется: включение обязано быть осознанным.
   */
  dualAxis?: boolean
  /** Границы правой оси; `null` в любой позиции — считать эту сторону. */
  yDomainRight?: readonly [number | null, number | null]
  includeYValuesRight?: readonly number[]
}

export interface PadDomainOptions {
  includeZero?: boolean
  /** Доля размаха, добавляемая с каждой стороны. */
  padRatio?: number
}

const EMPTY_DOMAIN: readonly [number, number] = [0, 1]

/**
 * Тип шкалы по данным: `Date` → время, строка → категории, число → линейная.
 *
 * Смотрим на первый не-пустой `x` первой непустой серии. Явный проп всегда
 * сильнее: угадывание — удобство, а не контракт.
 */
export function inferScaleKind(series: readonly GrChartSeries[]): GrChartScaleKind {
  for (const item of series) {
    const first = item.data?.[0]?.x ?? item.x?.[0]

    if (first === undefined)
      continue
    if (first instanceof Date)
      return 'time'
    if (typeof first === 'string')
      return 'band'

    return 'linear'
  }

  return 'linear'
}

/**
 * Тип шкалы для входа любого вида: явный проп сильнее вывода.
 *
 * Нужен снаружи потому, что опорная линия расширяет домен, а разобрать её
 * значение (`Date`, ISO-строка, имя категории) можно только зная тип оси — то
 * есть **до** нормализации, внутри которой домен и считается.
 */
export function resolveScaleKind(
  input: readonly GrChartSeries[] | readonly (number | null)[],
  explicit?: GrChartScaleKind,
): GrChartScaleKind {
  return explicit ?? inferScaleKind(asSeriesList(input))
}

/** Размах конечных значений; `null` — считать нечего. */
export function extentOf(values: Iterable<number | null>): [number, number] | null {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  let seen = false

  for (const value of values) {
    if (value === null || !Number.isFinite(value))
      continue

    seen = true
    if (value < min)
      min = value
    if (value > max)
      max = value
  }

  return seen ? [min, max] : null
}

/**
 * Домен, пригодный для рисования.
 *
 * Вырожденный размах (все значения равны) разводится на половину единицы: ось
 * из одной линии не читается вовсе, а деление на ноль в шкале дало бы `NaN`
 * на всём графике.
 */
export function padDomain(
  domain: readonly [number, number],
  options: PadDomainOptions = {},
): [number, number] {
  let [min, max] = domain

  if (options.includeZero) {
    min = Math.min(min, 0)
    max = Math.max(max, 0)
  }

  if (min === max)
    return [min - 0.5, max + 0.5]

  const pad = (max - min) * (options.padRatio ?? 0)

  return [min - pad, max + pad]
}

export function normalizeChartData(
  input: readonly GrChartSeries[] | readonly (number | null)[],
  options: NormalizeOptions = {},
): ChartData {
  const series = asSeriesList(input)
  const kind = options.kind ?? inferScaleKind(series)
  const categories = kind === 'band' ? collectCategories(series) : []
  const categoryIndex = new Map(categories.map((name, index) => [name, index]))
  const sort = kind === 'band' ? false : options.sort !== false

  const normalized: NormalizedSeries[] = series.map((item, index) => {
    const points = readPoints(item, kind, categoryIndex)

    if (sort)
      points.sort((a, b) => a.x - b.x)

    return {
      id: item.id,
      label: item.label ?? item.id,
      colorIndex: index,
      style: seriesStyle(index, { color: item.color, fill: item.fillColor, shape: item.shape, dash: item.dash }),
      hidden: item.hidden === true,
      // Без `dualAxis` ось у всех серий левая: поле в данных само по себе
      // вторую ось не включает.
      axis: options.dualAxis ? item.axis ?? 'left' : 'left',
      points,
    }
  })

  // Домены и позиции считаются по **видимым** сериям: скрытая серия не должна
  // держать ось растянутой под значение, которого на экране нет.
  const visible = normalized.filter(item => !item.hidden)
  const positions = collectPositions(visible)

  const left = visible.filter(item => item.axis === 'left')
  const right = options.dualAxis ? visible.filter(item => item.axis === 'right') : []

  if (options.stacked) {
    // Стек считается по группе на ось, каждая со своими итогами: полоса из
    // долларов, положенная на полосу из штук, не значит ничего.
    applyStack(left, options.stacked === '100%')
    applyStack(right, options.stacked === '100%')
  }

  return {
    kind,
    series: normalized,
    categories,
    xDomain: resolveXDomain(kind, categories, positions, options.includeXValues),
    yDomain: resolveYDomain(axisExtent(left, options.stacked), options),
    yDomainRight: right.length === 0
      ? undefined
      : resolveYDomain(axisExtent(right, options.stacked), {
          ...options,
          yDomain: options.yDomainRight,
          includeYValues: options.includeYValuesRight,
        }),
    positions,
  }
}

/**
 * Размах группы серий.
 *
 * У стека — по вершинам полос, а не по значениям: иначе верхняя серия уходила
 * бы за верхний край на сумму нижних.
 */
function axisExtent(
  series: readonly NormalizedSeries[],
  stacked: NormalizeOptions['stacked'],
): [number, number] | null {
  return stacked
    ? extentOf(series.flatMap(item => item.points.map(point => point.stackTop ?? null)))
    : extentOf(series.flatMap(item => item.points.map(point => point.y)))
}

/**
 * Раскладка серий по стеку: первая серия внизу.
 *
 * Пропуск в серии **не двигает соседей вверх**: он просто ничего не добавляет к
 * сумме, а собственная полоса серии в этом месте рвётся. Альтернативы хуже:
 * протянуть последнее известное значение — это нарисовать данные, которых не
 * было. Отсюда практическое следствие, о котором стоит знать: у ряда с дырами
 * сумма в этом месте занижена, и стек честнее строить по полным рядам.
 */
function applyStack(series: readonly NormalizedSeries[], normalize: boolean): void {
  const totals = new Map<number, number>()

  for (const item of series) {
    for (const point of item.points) {
      if (point.y === null)
        continue

      const base = totals.get(point.x) ?? 0
      const top = base + point.y

      point.stackBase = base
      point.stackTop = top
      totals.set(point.x, top)
    }
  }

  if (!normalize)
    return

  // Второй проход, а не деление на лету: доля считается от **итога** столбца, а
  // он известен только после того, как сложены все серии.
  for (const item of series) {
    for (const point of item.points) {
      if (point.stackTop === undefined)
        continue

      const total = totals.get(point.x) ?? 0

      // Пустой столбец нормировать не на что: рисовать в нём нечего, и деление
      // на ноль дало бы `NaN` на всём графике.
      point.stackBase = total > 0 ? point.stackBase! / total : 0
      point.stackTop = total > 0 ? point.stackTop / total : 0
    }
  }
}

function asSeriesList(
  input: readonly GrChartSeries[] | readonly (number | null)[],
): readonly GrChartSeries[] {
  if (input.length === 0)
    return []

  // Вид входа решает **первый непустой** элемент, а не нулевой: ряд вполне
  // может начинаться с пропуска (`[null, null, 5]`), и по `input[0]` голый ряд
  // чисел неотличим от списка серий — а разобранный не тем способом он роняет
  // компонент на первом же обращении к `point.x`.
  const sample = input.find(item => item !== null && item !== undefined)

  if (sample === undefined || typeof sample !== 'object')
    return [{ id: 'series-1', y: input as readonly (number | null)[] }]

  return input as readonly GrChartSeries[]
}

function collectCategories(series: readonly GrChartSeries[]): string[] {
  const seen = new Set<string>()
  const order: string[] = []
  let duplicates = 0

  for (const item of series) {
    const values = item.data ? item.data.map(point => point.x) : item.x ?? []
    // Повтор **внутри одной серии** — это две полосы с одной подписью, их
    // читателю не различить. Повтор **между сериями** — норма и вообще смысл
    // категориальной оси: у всех серий она общая. Предупреждать на втором
    // случае значит спамить консоль на каждом мультисерийном графике.
    const own = new Set<string>()

    for (const value of values) {
      const name = String(value)

      if (own.has(name)) {
        duplicates++
        continue
      }

      own.add(name)

      if (seen.has(name))
        continue

      seen.add(name)
      order.push(name)
    }
  }

  if (duplicates > 0) {
    console.warn(
      `[granularity-charts] в серии повторяются категории (${duplicates}) — точки объединены по имени`,
    )
  }

  return order
}

function readPoints(
  series: GrChartSeries,
  kind: GrChartScaleKind,
  categoryIndex: ReadonlyMap<string, number>,
): NormalizedPoint[] {
  if (series.data && (series.x || series.y))
    console.warn(`[granularity-charts] серия «${series.id}»: заданы и \`data\`, и \`x\`/\`y\` — взят \`data\``)

  if (series.data) {
    return series.data.map((point, index) => ({
      x: toNumericX(point.x, index, kind, categoryIndex),
      y: toNumericY(point.y),
      sourceIndex: index,
      raw: point.x,
      label: point.label,
    }))
  }

  const values = series.y ?? []

  return values.map((value, index) => {
    // `x` не задан — им становится порядковый номер: ряд без собственной оси
    // это самый частый вход, и требовать для него отдельный массив незачем.
    const raw = series.x?.[index] ?? index

    return {
      x: toNumericX(raw, index, kind, categoryIndex),
      y: toNumericY(value),
      sourceIndex: index,
      raw,
    }
  })
}

function toNumericX(
  raw: GrChartXValue,
  index: number,
  kind: GrChartScaleKind,
  categoryIndex: ReadonlyMap<string, number>,
): number {
  if (kind === 'band')
    return categoryIndex.get(String(raw)) ?? index
  if (raw instanceof Date)
    return raw.getTime()
  if (typeof raw === 'number')
    return Number.isFinite(raw) ? raw : index

  const parsed = Number(raw)

  return Number.isFinite(parsed) ? parsed : index
}

/** `NaN`, `Infinity` и `undefined` — это пропуск, а не повод бросить исключение. */
function toNumericY(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function collectPositions(series: readonly NormalizedSeries[]): number[] {
  const unique = new Set<number>()

  for (const item of series) {
    for (const point of item.points)
      unique.add(point.x)
  }

  return [...unique].sort((a, b) => a - b)
}

/** Размах данных плюс закреплённые значения; `null` — вместить нечего. */
function mergeExtent(
  extent: [number, number] | null,
  values: readonly number[] | undefined,
): [number, number] | null {
  const extra = values === undefined || values.length === 0 ? null : extentOf(values)

  if (!extent)
    return extra
  if (!extra)
    return extent

  return [Math.min(extent[0], extra[0]), Math.max(extent[1], extra[1])]
}

function resolveXDomain(
  kind: GrChartScaleKind,
  categories: readonly string[],
  positions: readonly number[],
  includeXValues: readonly number[] | undefined,
): readonly [number, number] {
  if (kind === 'band')
    return [0, Math.max(0, categories.length - 1)]

  const merged = mergeExtent(
    positions.length === 0 ? null : [positions[0]!, positions[positions.length - 1]!],
    includeXValues,
  )

  if (!merged)
    return EMPTY_DOMAIN

  const [first, last] = merged

  // Единственная точка: линии нет, но маркер обязан встать в середину холста,
  // а не в его левый край.
  return first === last ? [first - 0.5, last + 0.5] : [first, last]
}

function resolveYDomain(
  extent: [number, number] | null,
  options: NormalizeOptions,
): readonly [number, number] {
  const [minOverride, maxOverride] = options.yDomain ?? [null, null]
  const merged = mergeExtent(extent, options.includeYValues)

  if (!merged) {
    return [
      minOverride ?? 0,
      maxOverride ?? 1,
    ]
  }

  // Стек всегда отсчитывается от нуля: полоса, висящая над осью, врёт о своей высоте.
  const padded = padDomain(merged, { includeZero: options.includeZero || options.stacked !== undefined && options.stacked !== false })

  return [minOverride ?? padded[0], maxOverride ?? padded[1]]
}
