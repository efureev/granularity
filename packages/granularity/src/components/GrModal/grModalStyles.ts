export type GrModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

// Корневые утилитарные классы, используемые шаблоном `GrModal.vue`.
// Они же являются единственным источником истины для safelist.
export const root = 'fixed inset-0 z-50'
export const shell = 'fixed inset-0 overflow-y-auto p-4 sm:p-6'
export const layout = 'min-h-full flex items-center justify-center'
export const overlay = 'fixed inset-0 z-0 bg-black/40'

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
  = 'w-full overflow-hidden relative z-10 border border-[var(--brd)] bg-[var(--card)] text-[var(--card-fg)] shadow-[var(--ds-shadow-2)] outline-none'

export const panelWidthBySize: Record<GrModalSize, string> = {
  sm: 'max-w-[420px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[920px]',
  full: 'max-w-none',
}

export const panelRadiusBySize: Record<GrModalSize, string> = {
  sm: 'rounded-[var(--ds-radius-xl)]',
  md: 'rounded-[var(--ds-radius-xl)]',
  lg: 'rounded-[var(--ds-radius-xl)]',
  xl: 'rounded-[var(--ds-radius-xl)]',
  full: 'rounded-none sm:rounded-[var(--ds-radius-xl)]',
}

// Для большинства размеров высота не задаётся — `Partial` + фильтрация пустых
// значений в `getGrModalPanelClass` избавляют от двойных пробелов.
export const panelHeightBySize: Partial<Record<GrModalSize, string>> = {
  full: 'h-[100svh] sm:h-auto',
}

export function getGrModalPanelClass(size: GrModalSize): string {
  return [
    panelBase,
    panelWidthBySize[size],
    panelHeightBySize[size],
    panelRadiusBySize[size],
  ]
    .filter(Boolean)
    .join(' ')
}
