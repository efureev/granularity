export type DsDropdownAlign = 'left' | 'right' | 'center'
export type DsDropdownWidth = 'auto' | '20' | '48' | '60' | '64' | '80'

export const widthClassByWidth: Record<DsDropdownWidth, string> = {
  auto: '',
  20: 'w-20',
  48: 'w-48',
  60: 'w-60',
  64: 'w-64',
  80: 'w-80',
}

export const alignmentClassByAlign: Record<DsDropdownAlign, string> = {
  left: 'origin-top-left',
  right: 'origin-top-right -translate-x-full',
  center: 'origin-top -translate-x-1/2',
}

export function dsDropdownWidthClass(width: DsDropdownWidth): string {
  return widthClassByWidth[width]
}

export function dsDropdownAlignmentClass(align: DsDropdownAlign): string {
  return alignmentClassByAlign[align]
}

export function dsDropdownContentClass(contentClass?: string): string {
  return [
    'rounded-[var(--ds-radius-xl)]',
    'border border-[var(--brd)]',
    'bg-[var(--card)] text-[var(--card-fg)]',
    'shadow-[var(--ds-shadow-2)]',
    'p-1',
    contentClass,
  ].filter(Boolean).join(' ')
}
