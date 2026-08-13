/**
 * Спарклайн рисуется в фиксированной системе координат и растягивается по
 * контейнеру: замера контейнера ему не нужно вовсе.
 *
 * Плата за растяжение — искажение штриха, и она снимается атрибутом
 * `vector-effect="non-scaling-stroke"`: он держит толщину постоянной.
 *
 * Чего он **не** держит — геометрию торцов и любых фигур: их система координат
 * растянута, и круглое в ней круглым не остаётся. Поэтому торцы линии `butt`,
 * а никаких точек и марок у спарклайна нет вовсе.
 */

export const VIEW_WIDTH = 100
export const VIEW_HEIGHT = 32

export const sparklineRootClass
  = 'block h-[var(--gr-sparkline-height,2rem)] w-full text-[var(--gr-fg)]'

/**
 * Отступ внутрь под штрих — и `overflow-visible` вместе с ним.
 *
 * Штрих не масштабируется вместе с холстом (в том и смысл `vector-effect`),
 * поэтому в единицах `viewBox` место под него не зарезервируешь: по горизонтали
 * одна единица — это ширина контейнера, делённая на сто, то есть в ячейке
 * таблицы и в карточке разные пиксели. Отступ живёт в CSS, где он пиксельный и
 * постоянный.
 *
 * `overflow-visible` обязателен в паре: у `<svg>` вьюпорт — content-box, и без
 * него отступ ничего не даст, клип срежет ровно то же самое. Вместе они
 * означают «рисунок не касается краёв элемента»: крайние значения видны
 * целиком, а прямой угол графика не спорит со скруглением карточки.
 */
export const sparklineCanvasClass
  = 'block h-full w-full overflow-visible p-[var(--gr-sparkline-inset,3px)]'

export const sparklineStroke = 'var(--gr-sparkline-color,var(--gr-chart-1))'
export const sparklineStrokeWidth = 'var(--gr-sparkline-width,1.5px)'
export const sparklineFillOpacity = 'var(--gr-sparkline-fill-opacity,0.15)'
