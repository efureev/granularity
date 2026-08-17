import type { Rect } from './chartLayout'

/**
 * Воронка: сколько дошло до каждой ступени и где теряется больше всего.
 *
 * Две доли считаются **разными знаменателями** и обе доступны наружу: от первой
 * ступени и от предыдущей. Смешивать их в одной подписи — классический способ
 * соврать: «конверсия 40 %» без указания знаменателя не значит ничего.
 */

export interface GrChartFunnelStage {
  label: string
  value: number
  color?: string
  meta?: unknown
}

export interface FunnelStage {
  index: number
  label: string
  value: number
  /** Доля от первой ступени. `null` — первая ступень нулевая, делить не на что. */
  shareFirst: number | null
  /** Доля от предыдущей ступени. У первой — `null`: предыдущей нет. */
  sharePrev: number | null
  /** Ступень больше предыдущей. Молча «выпрямлять» такое нельзя. */
  rising: boolean
  /** Прямоугольник ступени; у трапеции это её габарит. */
  rect: Rect
  /**
   * Трапеция: ширина у входа и у выхода.
   *
   * У полосы (`shape: 'bar'`) обе равны ширине прямоугольника — форма меняется,
   * значения нет.
   */
  from: number
  to: number
}

export interface FunnelOptions {
  plot: Rect
  orientation?: 'vertical' | 'horizontal'
  shape?: 'trapezoid' | 'bar'
  /** Зазор между ступенями в пикселях. */
  gap?: number
  /**
   * Наименьшая доля поперечника у ступени.
   *
   * Нулевая ступень не должна схлопываться в невидимость: «сюда не дошёл никто»
   * — это результат, а не отсутствие ступени.
   */
  minShare?: number
}

const DEFAULT_MIN_SHARE = 0.02

function finite(value: number): number {
  return Number.isFinite(value) ? value : 0
}

/**
 * Ступени воронки: обе доли и геометрия.
 *
 * Ширина ступени пропорциональна **значению**, а не порядку. Убывание рисуется
 * потому, что оно есть в данных, а не потому, что так выглядит воронка.
 */
export function funnelStages(
  stages: readonly GrChartFunnelStage[],
  options: FunnelOptions,
): FunnelStage[] {
  const { plot } = options
  const horizontal = options.orientation === 'horizontal'
  const trapezoid = options.shape !== 'bar'
  const gap = Math.max(0, options.gap ?? 0)
  const minShare = Math.max(0, options.minShare ?? DEFAULT_MIN_SHARE)
  const count = stages.length

  if (count === 0)
    return []

  const values = stages.map(stage => finite(stage.value))
  const first = values[0]!
  const peak = Math.max(...values)

  /** Доля поперечника: от пика, а не от первой ступени — иначе рост уехал бы за холст. */
  function widthShare(value: number): number {
    const share = peak > 0 ? value / peak : 0

    return Math.max(minShare, Math.min(1, share))
  }

  const along = horizontal ? plot.width : plot.height
  const across = horizontal ? plot.height : plot.width
  const step = count > 0 ? along / count : 0
  const size = Math.max(0, step - gap)

  return stages.map((stage, index) => {
    const value = values[index]!
    const previous = index === 0 ? null : values[index - 1]!
    const own = widthShare(value) * across
    // Трапеция сужается к следующей ступени; у последней выход равен входу —
    // обрезать её в точку значило бы нарисовать нулевое значение.
    const next = index === count - 1 ? own : widthShare(values[index + 1]!) * across
    const from = own
    const to = trapezoid ? next : own
    const widest = Math.max(from, to)
    const offset = (horizontal ? plot.x : plot.y) + step * index + gap / 2
    const center = (horizontal ? plot.y : plot.x) + across / 2

    return {
      index,
      label: stage.label,
      value,
      shareFirst: first > 0 ? value / first : null,
      sharePrev: previous === null ? null : previous > 0 ? value / previous : null,
      rising: previous !== null && value > previous,
      rect: horizontal
        ? { x: offset, y: center - widest / 2, width: size, height: widest }
        : { x: center - widest / 2, y: offset, width: widest, height: size },
      from,
      to,
    }
  })
}

/**
 * Путь ступени.
 *
 * Трапеция строится по четырём точкам, а не масштабированием прямоугольника:
 * сужение идёт **вдоль** ступени, и `transform` исказил бы толщину обводки.
 */
export function funnelPath(stage: FunnelStage, horizontal = false): string {
  const { rect, from, to } = stage
  const n = (value: number): number => Math.round(value * 100) / 100

  if (horizontal) {
    const center = rect.y + rect.height / 2
    const left = rect.x
    const right = rect.x + rect.width

    return [
      `M ${n(left)} ${n(center - from / 2)}`,
      `L ${n(right)} ${n(center - to / 2)}`,
      `L ${n(right)} ${n(center + to / 2)}`,
      `L ${n(left)} ${n(center + from / 2)}`,
      'Z',
    ].join(' ')
  }

  const center = rect.x + rect.width / 2
  const top = rect.y
  const bottom = rect.y + rect.height

  return [
    `M ${n(center - from / 2)} ${n(top)}`,
    `L ${n(center + from / 2)} ${n(top)}`,
    `L ${n(center + to / 2)} ${n(bottom)}`,
    `L ${n(center - to / 2)} ${n(bottom)}`,
    'Z',
  ].join(' ')
}
