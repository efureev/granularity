import type { GrChartScale } from './chartScale'

/**
 * Арифметика видимого окна по абсциссе.
 *
 * Модуль чистый — ни Vue, ни DOM: жест приносит сюда два числа, забирает окно
 * и больше ни о чём не знает. Отсюда же следует, что окно можно посчитать без
 * графика — приложению, восстанавливающему приближение из адресной строки.
 *
 * Само окно — пара значений **домена**, а не пикселей: пиксели живут ровно
 * столько, сколько текущая ширина холста, а окно переживает и ресайз, и
 * перезагрузку страницы.
 */

export type GrChartXWindow = readonly [number, number]

/**
 * Окно из двух пиксельных абсцисс протяжки.
 *
 * Порядок концов не важен: тянуть справа налево так же естественно, как слева
 * направо, и требовать от руки одного направления незачем.
 */
export function windowFromPixels(scale: GrChartScale, aPx: number, bPx: number): GrChartXWindow {
  const from = scale.invert(aPx)
  const to = scale.invert(bPx)

  return from < to ? [from, to] : [to, from]
}

/**
 * Сузить или расширить окно вокруг якоря; `factor < 1` — приблизить.
 *
 * Якорь остаётся на месте: точка под указателем не должна уезжать из-под него,
 * иначе колесо превращается в лотерею.
 */
export function zoomWindow(current: GrChartXWindow, factor: number, anchor: number): GrChartXWindow {
  const [from, to] = current

  return [anchor - (anchor - from) * factor, anchor + (to - anchor) * factor]
}

/**
 * Окно внутрь полного ряда и не уже минимума.
 *
 * `null` — окно накрыло весь ряд. Это ровно то значение, которое принимает проп
 * `xWindow`, поэтому «сброс» нигде не приходится выражать отдельным флагом, а
 * приложение, привязавшее `v-model`, по `null` узнаёт, что приближения больше
 * нет.
 *
 * `full` — размах **всего** ряда, а не текущего окна: считай мы от окна, из
 * приближения нельзя было бы выйти.
 */
export function clampWindow(
  window: GrChartXWindow,
  full: GrChartXWindow,
  minSpan = 0,
): GrChartXWindow | null {
  const [first, last] = full

  if (!Number.isFinite(window[0]) || !Number.isFinite(window[1]) || !(last > first))
    return null

  const span = Math.min(Math.max(window[1] - window[0], minSpan), last - first)

  // Упёршись в край, окно не сжимается, а сдвигается: иначе приближение у
  // конца ряда молча теряло бы половину заказанной ширины.
  let from = Math.max(first, Math.min(window[0], last - span))
  let to = from + span

  if (to > last) {
    to = last
    from = last - span
  }

  return from <= first && to >= last ? null : [from, to]
}

/**
 * Наименьший промежуток между соседними позициями — пол приближения.
 *
 * По самому плотному участку, а не по среднему шагу: на ряде с разрежённым
 * хвостом средний шаг разрешил бы приближение, при котором в окне не осталось
 * бы ни одной точки. `0` — мерить нечего, пола нет.
 */
export function smallestGap(positions: readonly number[]): number {
  let smallest = Infinity

  for (let i = 1; i < positions.length; i++)
    smallest = Math.min(smallest, positions[i]! - positions[i - 1]!)

  return Number.isFinite(smallest) && smallest > 0 ? smallest : 0
}
