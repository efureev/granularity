import type { GrComponentSize } from '../shared/sizes'

export type GrFormFileSize = GrComponentSize

/** Имя файла, плейсхолдер, список выбранного. */
export const textSizes: Record<GrFormFileSize, string> = {
  xs: 'text-[length:var(--gr-control-text-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-leading-sm)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-leading-base)]',
}

/** Ссылка «удалить» у элемента списка — на ступень мельче имени файла. */
export const removeTextSizes: Record<GrFormFileSize, string> = {
  xs: 'text-[length:var(--gr-control-text-3xs)]',
  sm: 'text-[length:var(--gr-control-text-2xs)]',
  md: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-leading-xs)]',
  lg: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-leading-sm)]',
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

/**
 * Миниатюра картинки в строке набора.
 *
 * Квадрат с кадрированием: файлы приходят любых пропорций, а строки списка
 * обязаны остаться одной высоты. Кадрирование — arbitrary-значением:
 * `object-cover` не знает ни `presetMini`, ни extra-rules, и класс молча не
 * превратился бы в CSS.
 */
export const previewSizes: Record<GrFormFileSize, string> = {
  xs: 'h-6 w-6',
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
}

export const previewBaseClass = 'shrink-0 rounded-[var(--gr-radius-sm)] [object-fit:cover] border border-[var(--gr-brd)]'

/** Кнопки берут размер из шкалы `GrButton` — на ступень ниже самого поля. */
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
