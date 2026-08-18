export type GrSortableOrientation = 'horizontal' | 'vertical'

/**
 * Классы `GrSortableList`. Единственный источник правды для шаблона и
 * `safelist.ts`: литерал, живущий только здесь, до скана UnoCSS не доходит —
 * хелпер уезжает в общий чанк `dist/chunks/`.
 */

export const listClass: Record<GrSortableOrientation, string> = {
  vertical: 'flex flex-col',
  horizontal: 'flex flex-row flex-wrap',
}

export const rowLayoutClass = 'relative flex items-center gap-2 px-4 py-3 transition-colors duration-[var(--gr-duration-fast)]'

/**
 * Строка — остановка роверного фокуса, поэтому кольцо на ней, а не на ручке:
 * с клавиатуры берут строку целиком, ручка остаётся affordance для мыши.
 */
export const rowFocusClass = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] focus-visible:ring-inset'

export const rowDraggingClass = 'bg-[var(--gr-sortable-row-bg-active,var(--gr-muted))]'

/** Взятая с клавиатуры строка обязана отличаться от просто сфокусированной. */
export const rowGrabbedClass = 'bg-[var(--gr-sortable-row-bg-active,var(--gr-muted))] ring-2 ring-[var(--gr-ring)] ring-inset'

export const rowDisabledClass = 'cursor-not-allowed bg-[var(--gr-muted)] text-[var(--gr-muted-fg)]'

export const dividedClass = 'divide-y divide-[var(--gr-brd)]'

export const emptyClass = 'px-4 py-6 text-center text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]'

/**
 * Ручка не табируется: внутри роверного композита свой таб-стоп сломал бы
 * правило «один Tab на список» — тот же приём, что у ручки `GrTree`.
 */
/**
 * `[touch-action:none]` вместо `touch-none`: утилиты нет ни в `presetMini`, ни
 * в extra-rules, класс молча не превратился бы в CSS — и вертикальный свайп по
 * ручке ушёл бы в прокрутку страницы. Тот же приём у дорожки `GrSlider`.
 */
export const handleClass = 'flex shrink-0 items-center justify-center rounded-[var(--gr-radius-sm)] text-[var(--gr-sortable-handle-color,var(--gr-muted-fg))] size-[var(--gr-sortable-handle-size,1.5rem)] cursor-grab [touch-action:none] focus:outline-none'

export const handleDisabledClass = 'cursor-not-allowed text-[var(--gr-muted-fg)]'


export const contentClass = 'min-w-0 flex-1 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]'

/**
 * Куда встанет строка — псевдоэлемент самой строки, а не отдельный узел:
 * лишний узел между строками ломает и `divide-y`, и подсчёт позиций.
 */
export const indicatorBeforeClass = 'before:absolute before:inset-x-0 before:top-0 before:h-[var(--gr-sortable-indicator-width,2px)] before:bg-[var(--gr-sortable-indicator,var(--gr-primary))] before:content-empty'

export const indicatorAfterClass = 'after:absolute after:inset-x-0 after:bottom-0 after:h-[var(--gr-sortable-indicator-width,2px)] after:bg-[var(--gr-sortable-indicator,var(--gr-primary))] after:content-empty'
