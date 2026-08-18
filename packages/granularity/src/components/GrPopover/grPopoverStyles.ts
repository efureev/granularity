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

/** Поле панели. `none` — поле рисует содержимое (меню, список опций). */
export type GrPopoverPadding = 'default' | 'none'

export const panelSizes: Record<GrPopoverSize, string> = {
  xs: 'p-2 text-[length:var(--gr-control-text-xs)]',
  sm: 'p-2.5 text-[length:var(--gr-control-text-sm)]',
  md: 'p-3 text-[length:var(--gr-control-text-md)] leading-[var(--gr-leading-sm)]',
  lg: 'p-4 text-[length:var(--gr-control-text-lg)] leading-[var(--gr-leading-base)]',
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
/**
 * Кегль без поля.
 *
 * Отдельная мапа, а не `contentClass="p-0"`: поле и кегль приезжают одной
 * строкой равной специфичности, и кто победит — решал бы порядок правил в
 * сгенерированном CSS. Меню внутри поповера с `p-3` — визуально не меню.
 */
export const panelSizesFlush: Record<GrPopoverSize, string> = {
  xs: 'text-[length:var(--gr-control-text-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-leading-sm)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-leading-base)]',
}

export const popoverPanelBaseClass = 'rounded-[var(--gr-radius-xl)] border border-[var(--gr-brd)] bg-[var(--gr-popover)] text-[var(--gr-popover-fg)] shadow-[var(--gr-shadow-2)] max-w-[min(22rem,calc(100vw-1rem))] focus:outline-none'

export function grPopoverPanelClass(
  size: GrPopoverSize,
  placement: Placement,
  extra?: string,
  padding: GrPopoverPadding = 'default',
): string {
  return [
    popoverPanelBaseClass,
    padding === 'none' ? panelSizesFlush[size] : panelSizes[size],
    grPopoverOriginClass(placement),
    extra ?? '',
  ].filter(Boolean).join(' ')
}
