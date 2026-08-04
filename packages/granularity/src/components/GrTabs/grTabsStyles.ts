import type { GrComponentSize } from '../shared/sizes'

export type GrTabsSize = GrComponentSize

/** Высота вкладки повторяет шкалу `GrButton`: вкладки часто стоят с ним в один ряд. */
export const tabSizes: Record<GrTabsSize, string> = {
  xs: 'h-7 px-2 text-[12px]',
  sm: 'h-8 px-2.5 text-[13px]',
  md: 'h-9 px-3 text-sm',
  lg: 'h-10 px-4 text-[15px]',
}

/** Счётчик у вкладки: на ступень мельче подписи, но не мельче 10px. */
export const tabBadgeSizes: Record<GrTabsSize, string> = {
  xs: 'text-[10px] px-1 py-0.5',
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-[11px] px-1.5 py-0.5',
  lg: 'text-[12px] px-2 py-0.5',
}

/** Обойма вокруг вкладок: на мелких ступенях рамка съедала бы высоту. */
export const tablistSizes: Record<GrTabsSize, string> = {
  xs: 'gap-0.5 p-0.5',
  sm: 'gap-1 p-1',
  md: 'gap-1 p-1',
  lg: 'gap-1 p-1.5',
}
