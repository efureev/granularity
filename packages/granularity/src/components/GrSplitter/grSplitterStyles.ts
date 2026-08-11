/**
 * Классы `GrSplitter`. Геометрия (толщина полосы, зона захвата, курсоры)
 * зависит от ориентации и от состояния жеста, поэтому живёт в собственном
 * `<style>` компонента, а не в утилитах.
 */

export const rootClass = 'grid h-full w-full'

/** Без `min-*: 0` содержимое панели распирает грид-трек и ломает раскладку. */
export const paneClass = 'min-h-0 min-w-0'

// `touch-none` в связке presetMini + presetGranular CSS не даёт — только произвольное свойство.
export const separatorClass = 'relative [touch-action:none] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] focus-visible:ring-inset'
