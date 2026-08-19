import type { Rect } from './chartLayout'

/**
 * Ориентация декартова графика.
 *
 * Модуль отвечает на один вопрос: какая экранная ось сейчас несёт категории, а
 * какая — значения. Всё остальное в пакете считается в терминах «вдоль» и
 * «поперёк», и тогда ветка ориентации живёт в одном месте, а не в каждом
 * тернаре компонента.
 *
 * Заведён потому, что горизонталь в пакете писалась трижды и каждый раз заново:
 * `GrChartBullet` и `GrChartFunnel` — своими шкалами, `GrChartWaterfall` — ещё и
 * своим прямоугольником вместо `barRect`. Четвёртая копия (у `GrChartBar`)
 * разошлась бы с остальными молча: рисунок «немного не тот» исключений не даёт.
 */
export type ChartOrientation = 'vertical' | 'horizontal'

/**
 * Экранная координата вдоль оси **категорий**.
 *
 * Вертикаль: категории идут слева направо, значит вдоль — это `x`.
 * Горизонталь: категории идут сверху вниз, значит вдоль — это `y`.
 */
export function alongOf(point: { x: number, y: number }, orientation: ChartOrientation): number {
  return orientation === 'horizontal' ? point.y : point.x
}

/** Экранная координата поперёк — по оси **значений**. */
export function acrossOf(point: { x: number, y: number }, orientation: ChartOrientation): number {
  return orientation === 'horizontal' ? point.x : point.y
}

/** Обратная сборка: из «вдоль» и «поперёк» в экранную точку. */
export function orientedPoint(along: number, across: number, orientation: ChartOrientation): { x: number, y: number } {
  return orientation === 'horizontal' ? { x: across, y: along } : { x: along, y: across };
}

/** Границы области поперёк — по ним проверяется, попал ли указатель в поле значений. */
export function acrossBounds(area: Rect, orientation: ChartOrientation): [number, number] {
  return orientation === 'horizontal'
    ? [area.x, area.x + area.width]
    : [area.y, area.y + area.height]
}

/** Длина области вдоль оси категорий — на неё делится полоса. */
export function alongExtent(area: Rect, orientation: ChartOrientation): number {
  return orientation === 'horizontal' ? area.height : area.width
}

/**
 * Своп сторон у `showGrid`.
 *
 * `showGrid` называет оси **по данным**, а не по экрану: `'y'` — это всегда
 * линии оси значений. При горизонтали они становятся вертикальными на экране,
 * поэтому раме, которая знает только про экран, значение подаётся перевёрнутым.
 */
export function orientedGrid<T extends 'x' | 'y' | 'both' | 'none'>(show: T, orientation: ChartOrientation): T {
  if (orientation !== 'horizontal') return show
  if (show === 'x') return 'y' as T
  if (show === 'y') return 'x' as T

  return show
}
