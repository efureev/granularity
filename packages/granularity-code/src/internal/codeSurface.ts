import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

/**
 * Общая поверхность кода: то, что обязано совпадать у блока, диффа и редактора.
 *
 * Три компонента показывают один и тот же код на одной и той же странице, и
 * разойдись у них кегль или отступ — семейство рассыпается на первом же экране,
 * где они стоят рядом.
 *
 * **Классы отсюда обязан объявить в своём `safelist` каждый импортёр.** Общий
 * модуль в `dist` уезжает в чанк, не принадлежащий ни одной директории
 * компонента, а пресет сканирует только `dist/components/<Name>/**` — без
 * объявления классы молча не доедут до CSS.
 */

/** Моноширинный шрифт и переносы — общая основа всех трёх поверхностей. */
export const codeSurfaceFontClass = 'font-mono'

export const codeSurfacePaddings: Record<GrComponentSize, string> = {
  xs: 'p-2',
  sm: 'p-2.5',
  md: 'p-3',
  lg: 'p-4',
}

/**
 * Кегль и парный межстрочный — со шкалы контролов, а не контентной.
 *
 * `text-*` в UnoCSS задаёт и кегль, и межстрочный, поэтому парный `leading`
 * обязателен: без него строка кода получила бы межстрочный от предыдущего
 * правила, и жёлоб с номерами разъехался бы с содержимым.
 */
export const codeSurfaceTextSizes: Record<GrComponentSize, string> = {
  xs: 'text-[length:var(--gr-control-text-3xs)] leading-[var(--gr-control-leading-3xs)]',
  sm: 'text-[length:var(--gr-control-text-2xs)] leading-[var(--gr-control-leading-2xs)]',
  md: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  lg: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
}

/**
 * Корень каждой из трёх поверхностей несёт `min-w-0`.
 *
 * Прокрутку длинных строк они берут на себя, но у грид- и флекс-элемента
 * `min-width` по умолчанию `auto`: без этого элемент раздувается под содержимое
 * вместо своей прокрутки и вылезает за родителя. Лог с длинной строкой —
 * обычный вход, а не край.
 */

/** Скроллящаяся область: достижима с клавиатуры, с видимым кольцом фокуса. */
export const codeSurfaceScrollClass
  = 'overflow-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const codeSurfaceWrapClass = 'whitespace-pre-wrap break-words'
export const codeSurfaceNowrapClass = 'whitespace-pre'
