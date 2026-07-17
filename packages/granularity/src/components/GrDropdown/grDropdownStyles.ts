import type { Placement } from '@floating-ui/dom'

export type GrDropdownAlign = 'left' | 'right' | 'center'
export type GrDropdownWidth = 'auto' | '20' | '48' | '60' | '64' | '80'

export const widthClassByWidth: Record<GrDropdownWidth, string> = {
  auto: '',
  20: 'w-20',
  48: 'w-48',
  60: 'w-60',
  64: 'w-64',
  80: 'w-80',
}

// `transform-origin` для scale-transition — координата x/y уже приходит от
// `useFloating` (см. `floatingStyle`), здесь остаётся только направление
// "роста" панели относительно триггера. Ключи — это `resolvedPlacement` ПОСЛЕ
// применения `flip`, поэтому origin остаётся верным и когда панели не хватило
// места снизу и её перевернуло вверх.
export const originClassByPlacement: Partial<Record<Placement, string>> = {
  'bottom-start': 'origin-top-left',
  'bottom-end': 'origin-top-right',
  'bottom': 'origin-top',
  'top-start': 'origin-bottom-left',
  'top-end': 'origin-bottom-right',
  'top': 'origin-bottom',
}

export function grDropdownWidthClass(width: GrDropdownWidth): string {
  return widthClassByWidth[width]
}

export function grDropdownOriginClass(placement: Placement): string {
  return originClassByPlacement[placement] ?? 'origin-top'
}

export function grDropdownContentClass(contentClass?: string): string {
  return [
    'rounded-[var(--ds-radius-xl)]',
    'border border-[var(--brd)]',
    'bg-[var(--card)] text-[var(--card-fg)]',
    'shadow-[var(--ds-shadow-2)]',
    'p-1',
    contentClass,
  ].filter(Boolean).join(' ')
}
