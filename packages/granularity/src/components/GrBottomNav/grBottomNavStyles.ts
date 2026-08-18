import type { GrComponentSize } from '../shared/sizes'

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

export const listClass = 'flex items-center justify-around'

/**
 * Размерная шкала панели: высота полосы, глиф и кегль подписи.
 *
 * Что тянуть у панели фиксированной высоты — вопрос неочевидный, и ответ здесь
 * ограничен снизу доступностью: **тач-таргет пункта не может стать меньше
 * 44×44** (WCAG 2.5.5). Поэтому ступень ужимает полосу и содержимое, а сам
 * пункт остаётся тем же прямоугольником под палец — `min-w-[44px]
 * min-h-[44px]` в `itemBase` вне шкалы намеренно.
 *
 * `md` совпадает с историческим видом панели: без пропа не меняется ничего.
 */
export const listSizes: Record<GrComponentSize, string> = {
  xs: 'h-12',
  sm: 'h-14',
  md: 'h-14',
  lg: 'h-16',
}

export const itemTextSizes: Record<GrComponentSize, string> = {
  xs: 'text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)]',
  sm: 'text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)]',
  md: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  lg: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
}

export const itemIconSizes: Record<GrComponentSize, string> = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export const itemBase = 'relative min-w-[44px] min-h-[44px] px-3 py-1 rounded-[var(--gr-radius-md)] flex flex-col items-center justify-center gap-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

/**
 * Активный пункт несёт три отличия сразу — подложку, вес и цвет. Одного цвета
 * мало: он не виден при монохромном зрении и не существует для диктора
 * (`aria-current` закрывает вторую половину задачи).
 */
export const itemActiveClass = 'bg-[var(--gr-muted)] font-600 text-[var(--gr-primary-text)]'
export const itemIdleClass = 'font-500 text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)]'

/** Недоступный пункт гасится токеном: `opacity` разбавляет выверенные на AA цвета. */
export const itemDisabledClass = 'cursor-not-allowed font-500 text-[var(--gr-disabled-fg)]'

export const itemIconClass = 'block shrink-0'
export const itemLabelClass = 'max-w-full truncate leading-none'

/**
 * Бейдж висит поверх правого верхнего угла пункта. Своя разметка, а не
 * `GrBadgeWrap`: зависимость притащила бы потребителю чужой CSS ради кружка.
 */
export const itemBadgeClass = 'absolute top-0.5 right-1 min-w-4 h-4 px-1 rounded-[var(--gr-radius-full)] bg-[var(--gr-danger)] text-[var(--gr-danger-fg)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] font-700 inline-flex items-center justify-center'

export function grBottomNavRootClass(options: {
  position: GrBottomNavPosition
  hideAbove: GrBottomNavHideAbove
}): string {
  return [rootBase, rootPositionClass[options.position], rootHideAboveClass[options.hideAbove]]
    .filter(Boolean)
    .join(' ')
}

export function grBottomNavListClass(size: GrComponentSize): string {
  return [listClass, listSizes[size]].join(' ')
}

export function grBottomNavIconClass(size: GrComponentSize): string {
  return [itemIconClass, itemIconSizes[size]].join(' ')
}

export function grBottomNavItemClass(options: {
  active: boolean
  disabled: boolean
  size: GrComponentSize
}): string {
  const state = options.disabled
    ? itemDisabledClass
    : options.active ? itemActiveClass : itemIdleClass

  return [itemBase, itemTextSizes[options.size], state].join(' ')
}
