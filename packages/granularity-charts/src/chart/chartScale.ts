/**
 * Шкалы: значение домена ↔ координата холста.
 *
 * Модуль чистый — ни Vue, ни DOM. Ошибка в шкале проявляется не исключением, а
 * «немного не тем» рисунком, поэтому проверяется она только тестом.
 */

export type GrChartScaleKind = 'linear' | 'time' | 'band'

export interface GrChartScale {
  kind: GrChartScaleKind
  domain: readonly [number, number]
  range: readonly [number, number]
  /** Значение домена → координата. */
  scale: (value: number) => number
  /** Координата → значение домена. Для `band` — индекс ближайшей полосы. */
  invert: (px: number) => number
  /** Ширина полосы. У непрерывных шкал — 0. */
  bandwidth: number
  /** Шаг между центрами полос. У непрерывных шкал — 0. */
  step: number
}

export interface BandScaleOptions {
  paddingInner?: number
  paddingOuter?: number
}

const DEFAULT_PADDING_INNER = 0.2
const DEFAULT_PADDING_OUTER = 0.1

/**
 * Непрерывная шкала.
 *
 * Вырожденный домен (`[v, v]`) не даёт деления на ноль: значение садится в
 * середину диапазона, а `invert` возвращает само `v`. Это не «на всякий
 * случай» — ряд из одинаковых значений встречается в первый же день.
 */
export function linearScale(
  domain: readonly [number, number],
  range: readonly [number, number],
): GrChartScale {
  return continuousScale('linear', domain, range)
}

/**
 * Шкала времени — та же арифметика, что у линейной.
 *
 * Отдельной функцией, а не флагом, потому что тип шкалы должен быть виден на
 * месте вызова: по `kind` расходятся и лестница делений (`chartTicks`), и
 * форматирование подписей (`chartFormat`).
 */
export function timeScale(
  domain: readonly [number, number],
  range: readonly [number, number],
): GrChartScale {
  return continuousScale('time', domain, range)
}

function continuousScale(
  kind: 'linear' | 'time',
  domain: readonly [number, number],
  range: readonly [number, number],
): GrChartScale {
  const [d0, d1] = domain
  const [r0, r1] = range
  const span = d1 - d0

  if (!Number.isFinite(span) || span === 0) {
    const middle = (r0 + r1) / 2

    return {
      kind,
      domain,
      range,
      scale: () => middle,
      invert: () => d0,
      bandwidth: 0,
      step: 0,
    }
  }

  const k = (r1 - r0) / span

  return {
    kind,
    domain,
    range,
    scale: value => r0 + (value - d0) * k,
    invert: px => d0 + (px - r0) / k,
    bandwidth: 0,
    step: 0,
  }
}

/**
 * Категориальная шкала.
 *
 * `scale(i)` отдаёт **центр** полосы, а не левый край, как в d3. Так удобнее
 * всему, что у нас есть: линия и маркеры ставятся по центру категории, курсор
 * и клавиатура ищут ближайший центр, а столбец рисуется от `center − bandwidth/2`.
 * Отличие от d3 намеренное и записано здесь, чтобы не «чинилось» обратно.
 */
export function bandScale(
  count: number,
  range: readonly [number, number],
  options: BandScaleOptions = {},
): GrChartScale {
  const [r0, r1] = range
  const paddingInner = options.paddingInner ?? DEFAULT_PADDING_INNER
  const paddingOuter = options.paddingOuter ?? DEFAULT_PADDING_OUTER
  const n = Math.max(0, Math.floor(count))
  const domain: readonly [number, number] = [0, Math.max(0, n - 1)]

  if (n === 0) {
    const middle = (r0 + r1) / 2

    return { kind: 'band', domain, range, scale: () => middle, invert: () => 0, bandwidth: 0, step: 0 }
  }

  const step = (r1 - r0) / (n - paddingInner + paddingOuter * 2)
  const bandwidth = step * (1 - paddingInner)
  const first = r0 + step * paddingOuter + bandwidth / 2

  return {
    kind: 'band',
    domain,
    range,
    scale: index => first + step * index,
    invert: (px) => {
      const raw = Math.round((px - first) / step)

      return Math.min(n - 1, Math.max(0, raw))
    },
    bandwidth,
    step,
  }
}

export function createScale(
  kind: GrChartScaleKind,
  domain: readonly [number, number],
  range: readonly [number, number],
  options?: BandScaleOptions,
): GrChartScale {
  if (kind === 'band')
    return bandScale(domain[1] - domain[0] + 1, range, options)

  return kind === 'time' ? timeScale(domain, range) : linearScale(domain, range)
}

/**
 * Шкала значений для серии.
 *
 * Отдельной функцией, чтобы `?? left` не размножился по трём компонентам: с
 * ним однажды разошлись бы расчёт марки и расчёт её базовой линии, и столбец
 * правой оси встал бы на чужой ноль.
 */
export function scaleForAxis(
  axis: 'left' | 'right',
  left: GrChartScale,
  right: GrChartScale | null,
): GrChartScale {
  return axis === 'right' && right !== null ? right : left
}

/**
 * Индекс ближайшей к координате позиции.
 *
 * Бинарным поиском, а не обходом: активная точка ищется на каждом движении
 * указателя, а точек бывает тысячи. `positions` обязан быть отсортирован —
 * это гарантирует нормализация (`chartModel`).
 *
 * Возвращает `-1` на пустом наборе: «нет активной точки» — валидное состояние,
 * а не ошибка.
 */
export function nearestIndex(
  positions: readonly number[],
  scale: GrChartScale,
  px: number,
): number {
  if (positions.length === 0)
    return -1

  const target = scale.invert(px)
  let lo = 0
  let hi = positions.length - 1

  while (lo < hi) {
    const mid = (lo + hi) >> 1

    if (positions[mid]! < target)
      lo = mid + 1
    else
      hi = mid
  }

  const right = lo
  const left = Math.max(0, lo - 1)

  return Math.abs(positions[right]! - target) < Math.abs(positions[left]! - target) ? right : left
}
