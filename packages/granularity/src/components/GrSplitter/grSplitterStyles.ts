/**
 * Классы `GrSplitter`. Геометрия (толщина полосы, зона захвата, курсоры)
 * зависит от ориентации и от состояния жеста, поэтому живёт в собственном
 * `<style>` компонента, а не в утилитах.
 */

export const rootClass = 'grid h-full w-full'

/** Без `min-*: 0` содержимое панели распирает грид-трек и ломает раскладку. */
export const paneClass = 'min-h-0 min-w-0'

/**
 * Свёрнутая панель — нулевой ширины, но содержимое у неё оставалось: без
 * обрезки оно рисовалось поверх второй панели, а фокусируемое внутри
 * оставалось в порядке `Tab`, невидимым. Свёрнутая панель обрезана и скрыта
 * (`invisible`), а `inert` убирает её из дерева доступности и обхода.
 */
export const paneCollapsedClass = 'overflow-hidden invisible'

// `touch-none` встроенный движок granum CSS не даёт — только произвольное свойство.
export const separatorClass = 'relative touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] focus-visible:ring-inset'
