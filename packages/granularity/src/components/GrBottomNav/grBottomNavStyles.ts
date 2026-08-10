/**
 * Брейкпоинт, начиная с которого панель скрывается. `none` — видна всегда:
 * киоск и PWA нижнюю навигацию не прячут.
 */
export const GR_BOTTOM_NAV_HIDE_ABOVE = ['sm', 'md', 'lg', 'none'] as const
export type GrBottomNavHideAbove = typeof GR_BOTTOM_NAV_HIDE_ABOVE[number]

/** Прижата к нижней кромке экрана или лежит обычным блоком в потоке. */
export const GR_BOTTOM_NAV_POSITIONS = ['fixed', 'static'] as const
export type GrBottomNavPosition = typeof GR_BOTTOM_NAV_POSITIONS[number]

export const rootBase = 'border-t border-[var(--gr-brd)] bg-[var(--gr-bg)] px-2 pb-[env(safe-area-inset-bottom)]'

export const rootPositionClass: Record<GrBottomNavPosition, string> = {
  fixed: 'fixed bottom-0 left-0 right-0 z-[var(--gr-z-bottom-nav)]',
  static: 'relative w-full',
}

export const rootHideAboveClass: Record<GrBottomNavHideAbove, string> = {
  sm: 'sm:hidden',
  md: 'md:hidden',
  lg: 'lg:hidden',
  none: '',
}

export const listClass = 'h-14 flex items-center justify-around'

export const itemBase = 'relative min-w-[44px] min-h-[44px] px-3 py-1 rounded-[var(--gr-radius-md)] flex flex-col items-center justify-center gap-0.5 text-[length:var(--gr-text-xs)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

/**
 * Активный пункт несёт три отличия сразу — подложку, вес и цвет. Одного цвета
 * мало: он не виден при монохромном зрении и не существует для диктора
 * (`aria-current` закрывает вторую половину задачи).
 */
export const itemActiveClass = 'bg-[var(--gr-muted)] font-600 text-[var(--gr-primary-text)]'
export const itemIdleClass = 'font-500 text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)]'

/** Недоступный пункт гасится токеном: `opacity` разбавляет выверенные на AA цвета. */
export const itemDisabledClass = 'cursor-not-allowed font-500 text-[var(--gr-disabled-fg)]'

export const itemIconClass = 'block h-5 w-5 shrink-0'
export const itemLabelClass = 'max-w-full truncate leading-none'

/**
 * Бейдж висит поверх правого верхнего угла пункта. Своя разметка, а не
 * `GrBadgeWrap`: зависимость притащила бы потребителю чужой CSS ради кружка.
 */
export const itemBadgeClass = 'absolute top-0.5 right-1 min-w-4 h-4 px-1 rounded-[var(--gr-radius-full)] bg-[var(--gr-danger)] text-[var(--gr-danger-fg)] text-[length:var(--gr-text-2xs)] font-700 inline-flex items-center justify-center'

export function grBottomNavRootClass(options: {
  position: GrBottomNavPosition
  hideAbove: GrBottomNavHideAbove
}): string {
  return [rootBase, rootPositionClass[options.position], rootHideAboveClass[options.hideAbove]]
    .filter(Boolean)
    .join(' ')
}

export function grBottomNavItemClass(options: {
  active: boolean
  disabled: boolean
}): string {
  const state = options.disabled
    ? itemDisabledClass
    : options.active ? itemActiveClass : itemIdleClass

  return [itemBase, state].join(' ')
}
