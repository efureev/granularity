import type { Rect } from './chartLayout'
import type { GrChartDashPattern } from './chartPath'
import type { GrChartScale, GrChartScaleKind } from './chartScale'

/**
 * Опорные линии и полосы: порог, план, норма, коридор допустимого.
 *
 * Отдельной сущностью, а не серией из константы. Серия-константа рисует то же
 * самое, но попадает в легенду равноправным рядом, растягивает домен оси,
 * участвует в стеке и уезжает в скрытую таблицу как «данные» — четыре
 * утверждения, ни одно из которых не верно.
 *
 * Наклонных линий здесь нет: тренд — это регрессия по данным, а не опора.
 */

export type GrChartReferenceValue = number | Date | string

export interface GrChartReference {
  /** К какой оси привязано значение. */
  axis: 'x' | 'y'
  /** Одно значение — линия. Пара — полоса между значениями. */
  value: GrChartReferenceValue | readonly [GrChartReferenceValue, GrChartReferenceValue]
  label?: string
  /** Роль темы. Не задана — `--gr-chart-frame-reference`. */
  color?: string
  dash?: GrChartDashPattern
  /** Куда прижать подпись вдоль линии. */
  labelAnchor?: 'start' | 'middle' | 'end'
}

/** Опора, приведённая к числам домена. Линия — это `from === to`. */
export interface NormalizedReference {
  /** Порядок во входе: ключ рендера и адрес в описании. */
  index: number
  axis: 'x' | 'y'
  from: number
  to: number
  band: boolean
  label: string | undefined
  color: string | undefined
  dash: GrChartDashPattern | undefined
  labelAnchor: 'start' | 'middle' | 'end'
  /**
   * Целиком за пределами домена: не рисуется, но остаётся в описании.
   *
   * Промолчать нельзя: «порог не виден» и «порога нет» — разные утверждения, а
   * отличить их читателю нечем.
   */
  outside: boolean
}

export interface ReferenceContext {
  kind: GrChartScaleKind
  /** Порядок категорий: опора по X у `band` адресуется именем категории. */
  categories?: readonly string[]
  xDomain: readonly [number, number]
  /** Домен оси значений — уже расширенный до «красивых» границ, как у шкалы. */
  yDomain: readonly [number, number]
}

export interface ReferenceMarksOptions {
  plot: Rect
  xScale: GrChartScale
  yScale: GrChartScale
  fontSizePx: number
  /** Отступ подписи от линии и от края области. */
  labelGap?: number
}

export interface ReferenceMark {
  index: number
  axis: 'x' | 'y'
  band: boolean
  /** Прямоугольник опоры, зажатый по области построения. У линии одна сторона нулевая. */
  x: number
  y: number
  width: number
  height: number
  label: string | undefined
  labelX: number
  labelY: number
  textAnchor: 'start' | 'middle' | 'end'
  color: string | undefined
  dash: GrChartDashPattern | undefined
}

const DEFAULT_LABEL_GAP = 4

function finiteOrNull(value: number): number | null {
  return Number.isFinite(value) ? value : null
}

/**
 * Значение опоры — к числу домена.
 *
 * Разбор свой, а не `toNumericX` модели: та для строки делает `Number(raw)`, и
 * ISO-дата у неё превращается в порядковый индекс. Опора по времени обязана
 * встать туда же, куда встал бы тот же момент, переданный `Date`.
 */
export function referenceValueToNumber(
  value: GrChartReferenceValue,
  axis: 'x' | 'y',
  kind: GrChartScaleKind,
  categories?: readonly string[],
): number | null {
  if (axis === 'x' && kind === 'band') {
    const index = categories?.indexOf(String(value)) ?? -1

    return index === -1 ? null : index
  }

  if (value instanceof Date)
    return finiteOrNull(value.getTime())

  if (typeof value === 'number')
    return finiteOrNull(value)

  if (axis === 'x' && kind === 'time') {
    const parsed = Date.parse(value)

    // Число в строке (epoch ms) `Date.parse` не понимает — для него запасной путь.
    return Number.isFinite(parsed) ? parsed : finiteOrNull(Number(value))
  }

  return finiteOrNull(Number(value))
}

function valuePair(value: GrChartReference['value']): readonly GrChartReferenceValue[] {
  return Array.isArray(value) ? value as readonly GrChartReferenceValue[] : [value as GrChartReferenceValue]
}

/**
 * Разбор входа: пара упорядочивается, неразбираемое отбрасывается, домен
 * проставляет `outside`.
 *
 * Порядок в паре не важен по построению: коридор `[1, 0.9]` и `[0.9, 1]` — одно
 * и то же утверждение, и требовать от потребителя сортировки значило бы ловить
 * его на ровном месте.
 */
export function normalizeReferences(
  references: readonly GrChartReference[],
  context: ReferenceContext,
): NormalizedReference[] {
  const result: NormalizedReference[] = []

  references.forEach((reference, index) => {
    const pair = valuePair(reference.value)
    const numbers = pair.map(value => referenceValueToNumber(value, reference.axis, context.kind, context.categories))

    // Полоса с неразобранным концом — это не полоса: нарисовать её от края
    // области значило бы придумать границу, которой потребитель не задавал.
    if (numbers.includes(null))
      return

    const values = numbers as number[]
    const from = Math.min(...values)
    const to = Math.max(...values)
    const domain = reference.axis === 'x' ? context.xDomain : context.yDomain
    const low = Math.min(domain[0], domain[1])
    const high = Math.max(domain[0], domain[1])

    result.push({
      index,
      axis: reference.axis,
      from,
      to,
      band: values.length > 1,
      label: reference.label,
      color: reference.color,
      dash: reference.dash,
      labelAnchor: reference.labelAnchor ?? (reference.axis === 'y' ? 'end' : 'start'),
      outside: to < low || from > high,
    })
  })

  return result
}

/**
 * Значения опор для расширения домена.
 *
 * Считаются **до** нормализации данных, поэтому без категорий и без шкал. У
 * категориальной оси это и не нужно: её домен — `[0, n−1]`, опора по X там
 * адресует существующую категорию и расширить ось не может.
 */
export function referenceDomainValues(
  references: readonly GrChartReference[],
  kind: GrChartScaleKind,
): { x: number[], y: number[] } {
  const x: number[] = []
  const y: number[] = []

  for (const reference of references) {
    const target = reference.axis === 'x' ? x : y

    for (const value of valuePair(reference.value)) {
      const numeric = referenceValueToNumber(value, reference.axis, kind)

      if (numeric !== null)
        target.push(numeric)
    }
  }

  return { x, y }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Пиксели, зажатие по области построения и место подписи.
 *
 * Опоры за пределами домена отсеиваются здесь, а не у вызывающего: рисовать их
 * нельзя, но `outside` обязан дожить до описания — значит фильтр стоит на пути
 * к рисунку, а не на пути к тексту.
 */
export function referenceMarks(
  references: readonly NormalizedReference[],
  options: ReferenceMarksOptions,
): ReferenceMark[] {
  const { plot, xScale, yScale } = options
  const gap = options.labelGap ?? DEFAULT_LABEL_GAP
  const left = plot.x
  const right = plot.x + plot.width
  const top = plot.y
  const bottom = plot.y + plot.height

  return references.filter(reference => !reference.outside).map((reference) => {
    if (reference.axis === 'y') {
      // Ось значений перевёрнута: большему значению отвечает меньший пиксель.
      const high = clamp(yScale.scale(reference.to), top, bottom)
      const low = clamp(yScale.scale(reference.from), top, bottom)
      const labelX = reference.labelAnchor === 'start'
        ? left + gap
        : reference.labelAnchor === 'middle' ? left + plot.width / 2 : right - gap

      return {
        index: reference.index,
        axis: reference.axis,
        band: reference.band,
        x: left,
        y: high,
        width: plot.width,
        height: low - high,
        label: reference.label,
        labelX,
        labelY: Math.max(top + options.fontSizePx, high - gap),
        textAnchor: reference.labelAnchor,
        color: reference.color,
        dash: reference.dash,
      }
    }

    const start = clamp(xScale.scale(reference.from), left, right)
    const end = clamp(xScale.scale(reference.to), left, right)
    const labelY = reference.labelAnchor === 'start'
      ? top + options.fontSizePx
      : reference.labelAnchor === 'middle' ? top + plot.height / 2 : bottom - gap

    return {
      index: reference.index,
      axis: reference.axis,
      band: reference.band,
      x: start,
      y: top,
      width: end - start,
      height: plot.height,
      label: reference.label,
      // Подпись вертикальной опоры центрируется по самой линии, а у полосы — по
      // её середине: прижимать её к краю не к чему, вдоль линии свободна высота.
      labelX: (start + end) / 2,
      labelY,
      textAnchor: 'middle' as const,
      color: reference.color,
      dash: reference.dash,
    }
  })
}
