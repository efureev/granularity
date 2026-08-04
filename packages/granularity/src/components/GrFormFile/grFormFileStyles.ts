import type { GrComponentSize } from '../shared/sizes'

export type GrFormFileSize = GrComponentSize

/** Имя файла, плейсхолдер, список выбранного. */
export const textSizes: Record<GrFormFileSize, string> = {
  xs: 'text-[12px]',
  sm: 'text-[13px]',
  md: 'text-sm',
  lg: 'text-base',
}

/** Ссылка «удалить» у элемента списка — на ступень мельче имени файла. */
export const removeTextSizes: Record<GrFormFileSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-[11px]',
  md: 'text-xs',
  lg: 'text-sm',
}

export const rowGaps: Record<GrFormFileSize, string> = {
  xs: 'gap-2',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
}

export const stackGaps: Record<GrFormFileSize, string> = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2.5',
}

/** Отступ между иконкой и подписью внутри кнопки. */
export const iconOffsets: Record<GrFormFileSize, string> = {
  xs: 'ml-1',
  sm: 'ml-1.5',
  md: 'ml-2',
  lg: 'ml-2',
}

/** Кнопки берут размер из шкалы `GrButton`; на `md` это исторический `sm`. */
export const buttonSizes: Record<GrFormFileSize, GrComponentSize> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'md',
}

/** Иконка внутри кнопки — из шкалы `GrIcon` (`xs…lg` → `14…20px`). */
export const iconSizes: Record<GrFormFileSize, GrComponentSize> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'md',
}
