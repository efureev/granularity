import type { GrOverlaySize } from '../shared/sizes'

export type GrModalSize = GrOverlaySize

/**
 * Кто скроллится при длинном содержимом: весь оверлей (`outside`, окно уезжает
 * вверх вместе со страницей) или сама панель (`inside`, окно остаётся на месте,
 * а шапка и подвал `GrDialog` — на виду).
 */
export type GrModalScrollBehavior = 'outside' | 'inside'

// Корневые утилитарные классы, используемые шаблоном `GrModal.vue`.
// Они же являются единственным источником истины для safelist.
export const root = 'fixed inset-0 z-[var(--gr-z-modal)]'
export const overlay = 'fixed inset-0 z-0 bg-[var(--gr-overlay-bg)]'

export const shellBase = 'fixed inset-0'

// Поля вокруг панели. У `full` их нет вовсе: размер означает «во весь экран», а
// паддинг оболочки вместе с `h-full` панели дал бы окно выше вьюпорта.
export const shellPaddingBySize: Record<GrModalSize, string> = {
  sm: 'p-4 sm:p-6',
  md: 'p-4 sm:p-6',
  lg: 'p-4 sm:p-6',
  xl: 'p-4 sm:p-6',
  full: '',
}

// Скролл живёт ровно в одном месте: либо в оболочке, либо в панели. Держать
// `overflow-y-auto` на обеих — значит получить два скроллбара на одно окно.
export const shellByScroll: Record<GrModalScrollBehavior, string> = {
  outside: 'overflow-y-auto',
  inside: 'overflow-hidden',
}

export const layoutByScroll: Record<GrModalScrollBehavior, string> = {
  outside: 'min-h-full flex items-center justify-center',
  inside: 'h-full flex items-center justify-center',
}

// Классы для `<TransitionChild :enter="..." :enter-from="..." ...>`.
// Разбиты по фазам транзишна, чтобы не склеивать их в «мешок токенов».
export const overlayTransition = {
  enter: 'duration-200 ease-out',
  enterFrom: 'opacity-0',
  enterTo: 'opacity-100',
  leave: 'duration-150 ease-in',
  leaveFrom: 'opacity-100',
  leaveTo: 'opacity-0',
} as const

export const panelTransition = {
  enter: 'duration-200 ease-out',
  enterFrom: 'opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95',
  enterTo: 'opacity-100 translate-y-0 sm:scale-100',
  leave: 'duration-150 ease-in',
  leaveFrom: 'opacity-100 translate-y-0 sm:scale-100',
  leaveTo: 'opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95',
} as const

export const panelBase
  = 'w-full relative z-10 border border-[var(--gr-brd)] bg-[var(--gr-card)] text-[var(--gr-card-fg)] shadow-[var(--gr-shadow-2)] outline-none'

// `overflow-hidden` панели нужен, чтобы её содержимое обрезалось по радиусу.
// При `inside` панель становится колонкой: заголовок остаётся на месте, а
// скроллится только тело — ради этого режим и заводят.
export const panelOverflowByScroll: Record<GrModalScrollBehavior, string> = {
  outside: 'overflow-hidden',
  inside: 'max-h-full flex flex-col overflow-hidden',
}

/** Тело окна при `inside`. `min-h-0` — иначе flex-потомок не даст себя сжать. */
export const panelBodyScrollClass = 'min-h-0 overflow-y-auto'

/** Шапка и подвал при `inside`: сжиматься должно тело, а не они. */
export const panelSectionClass = 'shrink-0'

export const panelWidthBySize: Record<GrModalSize, string> = {
  sm: 'max-w-[420px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[920px]',
  full: 'max-w-none',
}

export const panelRadiusBySize: Record<GrModalSize, string> = {
  sm: 'rounded-[var(--gr-radius-xl)]',
  md: 'rounded-[var(--gr-radius-xl)]',
  lg: 'rounded-[var(--gr-radius-xl)]',
  xl: 'rounded-[var(--gr-radius-xl)]',
  full: 'rounded-none',
}

// Для большинства размеров высота не задаётся — `Partial` + фильтрация пустых
// значений в `getGrModalPanelClass` избавляют от двойных пробелов.
export const panelHeightBySize: Partial<Record<GrModalSize, string>> = {
  full: 'h-full',
}

export function getGrModalPanelClass(
  size: GrModalSize,
  scrollBehavior: GrModalScrollBehavior = 'outside',
): string {
  return [
    panelBase,
    panelOverflowByScroll[scrollBehavior],
    panelWidthBySize[size],
    panelHeightBySize[size],
    panelRadiusBySize[size],
  ]
    .filter(Boolean)
    .join(' ')
}

export function getGrModalShellClass(size: GrModalSize, scrollBehavior: GrModalScrollBehavior): string {
  return [shellBase, shellPaddingBySize[size], shellByScroll[scrollBehavior]]
    .filter(Boolean)
    .join(' ')
}
