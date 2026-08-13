/**
 * Спарклайн рисуется в фиксированной системе координат и растягивается по
 * контейнеру: замера контейнера ему не нужно вовсе.
 *
 * Плата за растяжение — искажение штриха, и она снимается атрибутом
 * `vector-effect="non-scaling-stroke"`. Он же решает задачу маркера: точка
 * рисуется нулевым отрезком с круглым торцом, поэтому остаётся круглой при
 * любом соотношении сторон. Обычный `<circle>` здесь превратился бы в эллипс.
 */

export const VIEW_WIDTH = 100
export const VIEW_HEIGHT = 32

export const sparklineRootClass
  = 'block h-[var(--gr-sparkline-height,2rem)] w-full text-[var(--gr-fg)]'

export const sparklineStroke = 'var(--gr-sparkline-color,var(--gr-chart-1))'
export const sparklineStrokeWidth = 'var(--gr-sparkline-width,1.5px)'
export const sparklineFillOpacity = 'var(--gr-sparkline-fill-opacity,0.15)'
export const sparklinePointStroke = 'var(--gr-sparkline-point,var(--gr-chart-1))'
