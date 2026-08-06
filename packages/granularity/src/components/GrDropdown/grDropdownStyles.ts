import type { Placement } from '@floating-ui/dom'

/** Ширина панели: число — пиксели, строка — CSS-длина, `auto` — по контенту. */
export type GrDropdownWidth = number | string

// `transform-origin` для scale-transition — координата x/y уже приходит от
// `useFloating` (см. `floatingStyle`), здесь остаётся только направление
// "роста" панели относительно триггера. Ключи — это `resolvedPlacement` ПОСЛЕ
// применения `flip`, поэтому origin остаётся верным и когда панели не хватило
// места снизу и её перевернуло вверх.
export const originClassByPlacement: Record<Placement, string> = {
  'bottom-start': 'origin-top-left',
  'bottom-end': 'origin-top-right',
  'bottom': 'origin-top',
  'top-start': 'origin-bottom-left',
  'top-end': 'origin-bottom-right',
  'top': 'origin-bottom',
  'left-start': 'origin-top-right',
  'left-end': 'origin-bottom-right',
  'left': 'origin-right',
  'right-start': 'origin-top-left',
  'right-end': 'origin-bottom-left',
  'right': 'origin-left',
}

export function grDropdownOriginClass(placement: Placement): string {
  return originClassByPlacement[placement] ?? 'origin-top'
}

export const dropdownContentBaseClass = 'rounded-[var(--gr-radius-xl)] border border-[var(--gr-brd)] bg-[var(--gr-card)] text-[var(--gr-card-fg)] shadow-[var(--gr-shadow-2)] p-1'

export function grDropdownContentClass(contentClass?: string): string {
  return [
    dropdownContentBaseClass,
    contentClass,
  ].filter(Boolean).join(' ')
}
