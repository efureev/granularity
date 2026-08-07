/** Сторона экрана, к которой прижата панель. */
export const GR_SIDEBAR_POSITIONS = ['left', 'right'] as const
export type GrSidebarPosition = typeof GR_SIDEBAR_POSITIONS[number]

/** Лендмарк корня: навигация или дополняющий блок (фильтры, справка). */
export const GR_SIDEBAR_LANDMARKS = ['complementary', 'navigation'] as const
export type GrSidebarLandmark = typeof GR_SIDEBAR_LANDMARKS[number]

export const rootBase = 'flex flex-col bg-[var(--gr-sidebar)] text-[var(--gr-sidebar-fg)] transition-[width] duration-200 ease-out'

/** Граница отделяет панель от контента, поэтому уезжает на внутреннюю сторону. */
export const rootPositions: Record<GrSidebarPosition, string> = {
  left: 'border-r border-[var(--gr-sidebar-brd)]',
  right: 'border-l border-[var(--gr-sidebar-brd)]',
}

export const headerBase = 'flex items-center gap-2 border-b border-[var(--gr-sidebar-brd)] px-3 py-4'

export const titleClass = 'truncate text-[length:var(--gr-text-lg)] font-700'
export const subtitleClass = 'truncate text-[length:var(--gr-text-sm)] text-[var(--gr-muted-fg)]'

/**
 * Скроллящийся блок обязан быть достижим с клавиатуры, поэтому он остановка
 * `Tab` с видимым кольцом: без него панель с текстовым содержимым не
 * проскроллить вовсе.
 */
export const contentBase = 'flex-1 overflow-y-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--gr-ring)]'

export const itemBase = 'relative flex w-full items-center rounded-lg text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const itemCollapsedClass = 'justify-center px-0 py-2'
export const itemExpandedClass = 'gap-3 px-3 py-2'

/**
 * Недоступный пункт гасится токеном, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены текста.
 */
export const itemDisabledClass = 'cursor-not-allowed text-[var(--gr-disabled-fg)]'
export const itemActiveClass = 'bg-[var(--gr-muted)] font-600 text-[var(--gr-fg)]'
export const itemIdleClass = 'text-[var(--gr-sidebar-fg)] hover:bg-[color-mix(in_srgb,var(--gr-sidebar-fg)_8%,transparent)]'

export const itemLetterClass = 'text-[length:var(--gr-text-xs)] font-700 leading-none'
export const itemBadgeClass = 'shrink-0 rounded-full bg-[color-mix(in_srgb,var(--gr-sidebar-fg)_12%,transparent)] px-1.5 py-0.5 text-[length:var(--gr-text-2xs)] font-600'

export const groupLabelClass = 'px-3 pb-1 pt-3 text-[length:var(--gr-text-2xs)] font-700 [text-transform:uppercase] tracking-wide text-[var(--gr-muted-fg)]'

/**
 * В свёрнутой панели заголовка секции нет — иначе он не помещается. Границы
 * между группами берёт на себя линия: без неё иконки соседних секций сливаются
 * в один столбец.
 */
export const groupCollapsedClass = 'mt-2 border-t border-[var(--gr-sidebar-brd)] pt-2'

export function grSidebarRootClass(position: GrSidebarPosition): string {
  return [rootBase, rootPositions[position]].join(' ')
}

/**
 * Куда указывает шеврон кнопки тогла: всегда в ту сторону, куда уедет панель.
 * У правой панели «свернуть» — это стрелка вправо.
 */
export function grSidebarCollapseDirection(
  position: GrSidebarPosition,
  collapsed: boolean,
): GrSidebarPosition {
  const toRight = (position === 'right') !== collapsed
  return toRight ? 'right' : 'left'
}

export function grSidebarItemClass(options: {
  collapsed: boolean
  disabled: boolean
  active: boolean
}): string {
  return [
    itemBase,
    options.collapsed ? itemCollapsedClass : itemExpandedClass,
    options.disabled ? itemDisabledClass : options.active ? itemActiveClass : itemIdleClass,
  ].join(' ')
}
