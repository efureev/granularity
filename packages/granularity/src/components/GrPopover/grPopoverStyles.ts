import type { Placement } from '@floating-ui/dom'

import type { GrComponentSize } from '../shared/sizes'

export type GrPopoverSize = GrComponentSize

/**
 * Роль панели.
 *
 * `dialog` — произвольный интерактивный контент (значение по умолчанию).
 * Остальные нужны компонентам, которые строятся поверх этого примитива:
 * меню (`GrMenu`, `GrContextMenu`), списки, палитры. Роль задаёт потребитель,
 * потому что клавиатурный паттерн принадлежит ему, а не поповеру.
 */
export type GrPopoverRole = 'dialog' | 'menu' | 'listbox' | 'grid' | 'group' | 'none'

export const panelSizes: Record<GrPopoverSize, string> = {
  xs: 'p-2 text-[length:var(--gr-control-text-xs)]',
  sm: 'p-2.5 text-[length:var(--gr-control-text-sm)]',
  md: 'p-3 text-sm',
  lg: 'p-4 text-base',
}

/**
 * `transform-origin` для scale-анимации: координаты панели уже посчитал
 * `useFloating`, здесь остаётся направление «роста» относительно триггера.
 *
 * Ключ — `resolvedPlacement`, то есть положение **после** `flip`: если снизу не
 * хватило места и панель перевернуло вверх, origin переворачивается вместе с ней.
 */
export const originClassByPlacement: Partial<Record<Placement, string>> = {
  'bottom': 'origin-top',
  'bottom-start': 'origin-top-left',
  'bottom-end': 'origin-top-right',
  'top': 'origin-bottom',
  'top-start': 'origin-bottom-left',
  'top-end': 'origin-bottom-right',
  'left': 'origin-right',
  'left-start': 'origin-top-right',
  'left-end': 'origin-bottom-right',
  'right': 'origin-left',
  'right-start': 'origin-top-left',
  'right-end': 'origin-bottom-left',
}

export function grPopoverOriginClass(placement: Placement): string {
  return originClassByPlacement[placement] ?? 'origin-top'
}

/**
 * Поверхность панели. `max-w-[min(...)]` не даёт поповеру вылезти за узкий
 * экран: `useFloating` смещает панель в пределах viewport, но не сужает её.
 */
export const popoverPanelBaseClass = 'rounded-[var(--gr-radius-xl)] border border-[var(--gr-brd)] bg-[var(--gr-popover)] text-[var(--gr-popover-fg)] shadow-[var(--gr-shadow-2)] max-w-[min(22rem,calc(100vw-1rem))] focus:outline-none'

export function grPopoverPanelClass(size: GrPopoverSize, placement: Placement, extra?: string): string {
  return [
    popoverPanelBaseClass,
    panelSizes[size],
    grPopoverOriginClass(placement),
    extra ?? '',
  ].filter(Boolean).join(' ')
}
