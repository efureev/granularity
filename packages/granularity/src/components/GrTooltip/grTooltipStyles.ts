import type { GrComponentSize } from '../shared/sizes'

export type GrTooltipSize = GrComponentSize

/** Панель подсказки: кегль и внутренние поля. */
export const panelSizes: Record<GrTooltipSize, string> = {
  xs: 'px-1.5 py-0.5 text-[length:var(--gr-control-text-3xs)]',
  sm: 'px-2 py-1 text-[length:var(--gr-control-text-2xs)]',
  md: 'px-2 py-1 text-[length:var(--gr-control-text-xs)]',
  lg: 'px-3 py-1.5 text-[length:var(--gr-control-text-md)]',
}

/** Ширина панели растёт вместе с кеглем — иначе на `lg` строка рвётся втрое. */
export const panelWidths: Record<GrTooltipSize, string> = {
  xs: 'max-w-[220px]',
  sm: 'max-w-[260px]',
  md: 'max-w-[280px]',
  lg: 'max-w-[340px]',
}

/** Дефолтный триггер — иконка info из шкалы `GrIcon` (`xs…lg` → `14…20px`). */
export const triggerIconSizes: Record<GrTooltipSize, GrComponentSize> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'md',
}
