export type GrDropdownMenuItemAlign = 'left' | 'center' | 'right'
export type GrDropdownMenuItemVariant = 'default' | 'danger'
export type GrDropdownMenuHeaderAlign = GrDropdownMenuItemAlign
export type GrDropdownMenuColumnAlign = GrDropdownMenuItemAlign
export type GrDropdownMenuColumnsCount = 2 | 3 | 4

export const alignClass: Record<GrDropdownMenuItemAlign, string> = {
  left: 'justify-start text-left',
  center: 'justify-center text-center',
  right: 'justify-end text-right',
}

export const textAlignClass: Record<GrDropdownMenuHeaderAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export const colsClass: Record<GrDropdownMenuColumnsCount, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

export const itemBaseClass = 'w-full min-h-10 px-4 py-2.5 flex items-center gap-2 text-[length:var(--gr-text-sm)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

// Насыщенный тон как цвет текста запрещён — для текста есть `-text`-роль.
export const itemVariantClass: Record<GrDropdownMenuItemVariant, string> = {
  default: 'text-[var(--gr-fg)]',
  danger: 'text-[var(--gr-danger-text)]',
}

export const itemInteractiveClass = 'cursor-pointer hover:bg-[var(--gr-accent)] hover:text-[var(--gr-accent-fg)]'

// Disabled гасится фоном, а не `opacity`: прозрачность разбавляет выверенные на
// AA токены текста. `pointer-events-none` оставлен — он же гасит hover.
export const itemDisabledClass = 'cursor-not-allowed pointer-events-none bg-[var(--gr-muted)] text-[var(--gr-muted-fg)]'

export const itemIndicatorClass = 'h-3.5 w-3.5 shrink-0'
export const itemShortcutClass = 'ml-auto pl-4 text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]'

export const headerClass = 'px-4 py-2 text-[length:var(--gr-text-xs)] tracking-wide text-[var(--gr-muted-fg)]'

export const listBaseClass = 'w-full'
export const dividersClass = 'divide-y divide-[var(--gr-brd)]'
export const borderTopClass = 'border-t border-[var(--gr-brd)]'
export const borderBottomClass = 'border-b border-[var(--gr-brd)]'

export const columnsBaseClass = 'w-full grid divide-x divide-[var(--gr-brd)]'
export const columnBaseClass = 'px-3 py-2 flex items-center'

export const dividerClass = 'border-t border-[var(--gr-brd)]'
export const dividerInsetClass = 'mx-2'

export function grDropdownMenuItemClass(options: {
  align: GrDropdownMenuItemAlign
  variant: GrDropdownMenuItemVariant
  disabled: boolean
}): string {
  return [
    itemBaseClass,
    alignClass[options.align],
    options.disabled ? itemDisabledClass : itemVariantClass[options.variant],
    options.disabled ? '' : itemInteractiveClass,
  ].filter(Boolean).join(' ')
}

export function grDropdownMenuListClass(options: {
  dividers: boolean
  borderTop: boolean
  borderBottom: boolean
}): string {
  return [
    listBaseClass,
    options.dividers ? dividersClass : '',
    options.borderTop ? borderTopClass : '',
    options.borderBottom ? borderBottomClass : '',
  ].filter(Boolean).join(' ')
}
