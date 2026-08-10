import type { GrComponentSize } from '../shared/sizes'

/**
 * Фон строки красит строка, а не кнопка-триггер.
 *
 * Слот `#extra` лежит рядом с триггером, а не внутри него (иначе
 * `nested-interactive`), поэтому подсветка, нарисованная кнопкой, обрывалась перед
 * ним: при `divided: false` она — единственная структура строк, и обрыв заметен.
 * Disabled гасится тем же фоном, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены текста.
 */
export const collapseRowBase = 'flex items-center transition-colors duration-[var(--gr-duration-fast)]'
export const collapseRowEnabledClass = 'hover:bg-[var(--gr-muted)]'
export const collapseRowDisabledClass = 'bg-[var(--gr-muted)]'

export const collapseHeaderBase = 'w-full flex items-center gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const collapseHeaderEnabledClass = 'cursor-pointer'
export const collapseHeaderDisabledClass = 'cursor-not-allowed text-[var(--gr-muted-fg)]'

export const collapseHeaderPaddings: Record<GrComponentSize, string> = {
  xs: 'px-3 py-2',
  sm: 'px-3 py-2.5',
  md: 'px-4 py-3',
  lg: 'px-5 py-4',
}

/** Правый инсет `#extra`: тот же горизонтальный отступ, что у заголовка строки. */
export const collapseExtraPaddings: Record<GrComponentSize, string> = {
  xs: 'pr-3',
  sm: 'pr-3',
  md: 'pr-4',
  lg: 'pr-5',
}

export const collapseTitleBase = 'flex-1 min-w-0'

export const collapseTitleTexts: Record<GrComponentSize, string> = {
  xs: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  md: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  lg: 'text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
}

export const collapseBodyPaddings: Record<GrComponentSize, string> = {
  xs: 'px-3 pb-2',
  sm: 'px-3 pb-3',
  md: 'px-4 pb-4',
  lg: 'px-5 pb-5',
}

export const collapseBodyBase = 'text-[var(--gr-muted-fg)]'

/**
 * Заглушка пустого аккордеона. Кегль и отступы берутся из тех же карт, что у
 * секций: пустое состояние — часть той же поверхности, и выпадать из её ритма
 * ему незачем.
 */
export const collapseEmptyBase = 'text-center text-[var(--gr-muted-fg)]'

export const collapseChevronBase = 'shrink-0 transition-transform duration-[var(--gr-duration-fast)] text-[var(--gr-muted-fg)]'
export const collapseChevronExpandedClass = 'rotate-180'

/** Размер шеврона отстаёт от размера секции на ступень — иначе он перевешивает заголовок. */
export const collapseChevronSizes: Record<GrComponentSize, GrComponentSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'sm',
  lg: 'md',
}

export function grCollapseRowClass(disabled: boolean): string {
  return [
    collapseRowBase,
    disabled ? collapseRowDisabledClass : collapseRowEnabledClass,
  ].join(' ')
}

export function grCollapseHeaderClass(options: { size: GrComponentSize, disabled: boolean }): string {
  return [
    collapseHeaderBase,
    collapseHeaderPaddings[options.size],
    options.disabled ? collapseHeaderDisabledClass : collapseHeaderEnabledClass,
  ].join(' ')
}

export function grCollapseTitleClass(size: GrComponentSize): string {
  return [collapseTitleBase, collapseTitleTexts[size]].join(' ')
}

export function grCollapseBodyClass(size: GrComponentSize): string {
  return [collapseBodyBase, collapseBodyPaddings[size], collapseTitleTexts[size]].join(' ')
}

export function grCollapseEmptyClass(size: GrComponentSize): string {
  return [collapseEmptyBase, collapseHeaderPaddings[size], collapseTitleTexts[size]].join(' ')
}

export function grCollapseChevronClass(expanded: boolean): string {
  return [collapseChevronBase, expanded ? collapseChevronExpandedClass : ''].filter(Boolean).join(' ')
}
