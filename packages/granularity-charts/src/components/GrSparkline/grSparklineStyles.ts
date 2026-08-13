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

/**
 * Отступ внутрь под штрих и маркер — и `overflow-visible` вместе с ним.
 *
 * Штрих и торец маркера не масштабируются вместе с холстом (в том и смысл
 * `vector-effect`), поэтому в единицах `viewBox` место под них не зарезервируешь:
 * по горизонтали одна единица — это ширина контейнера, делённая на сто, то есть
 * в ячейке таблицы и в карточке разные пиксели. Отступ живёт в CSS, где он
 * пиксельный и постоянный.
 *
 * `overflow-visible` обязателен в паре: у `<svg>` вьюпорт — content-box, и без
 * него отступ ничего не даст — клип срежет ровно то же самое. Вместе они
 * означают «рисунок не касается краёв элемента», то есть крайняя точка и
 * маркер видны целиком, а прямой угол графика не спорит со скруглением
 * карточки.
 */
export const sparklineRootClass
  = 'block h-[var(--gr-sparkline-height,2rem)] w-full overflow-visible '
    + 'p-[var(--gr-sparkline-inset,3px)] text-[var(--gr-fg)]'

export const sparklineStroke = 'var(--gr-sparkline-color,var(--gr-chart-1))'
export const sparklineStrokeWidth = 'var(--gr-sparkline-width,1.5px)'
export const sparklineFillOpacity = 'var(--gr-sparkline-fill-opacity,0.15)'
export const sparklinePointStroke = 'var(--gr-sparkline-point,var(--gr-chart-1))'
