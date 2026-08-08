import type { GrComponentSize } from '../shared/sizes'

export const collapseHeaderBase = 'w-full flex items-center gap-4 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

// Disabled гасится фоном, а не `opacity`: прозрачность разбавляет выверенные на AA
// токены текста, а заголовок секции — самый заметный текст аккордеона.
export const collapseHeaderEnabledClass = 'cursor-pointer hover:bg-[var(--gr-muted)]'
export const collapseHeaderDisabledClass = 'cursor-not-allowed bg-[var(--gr-muted)] text-[var(--gr-muted-fg)]'

export const collapseHeaderPaddings: Record<GrComponentSize, string> = {
  xs: 'px-3 py-2',
  sm: 'px-3 py-2.5',
  md: 'px-4 py-3',
  lg: 'px-5 py-4',
}

export const collapseTitleBase = 'flex-1 min-w-0'

export const collapseTitleTexts: Record<GrComponentSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
}

export const collapseBodyPaddings: Record<GrComponentSize, string> = {
  xs: 'px-3 pb-2',
  sm: 'px-3 pb-3',
  md: 'px-4 pb-4',
  lg: 'px-5 pb-5',
}

export const collapseBodyBase = 'text-[var(--gr-muted-fg)]'

export const collapseChevronBase = 'shrink-0 transition-transform duration-150 text-[var(--gr-muted-fg)]'
export const collapseChevronExpandedClass = 'rotate-180'

/** Размер шеврона отстаёт от размера секции на ступень — иначе он перевешивает заголовок. */
export const collapseChevronSizes: Record<GrComponentSize, GrComponentSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'sm',
  lg: 'md',
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

export function grCollapseChevronClass(expanded: boolean): string {
  return [collapseChevronBase, expanded ? collapseChevronExpandedClass : ''].filter(Boolean).join(' ')
}
