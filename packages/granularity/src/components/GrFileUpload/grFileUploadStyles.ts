import type { GrComponentSize } from '../shared/sizes'

export type GrFileUploadSize = GrComponentSize

/** Поля дроп-зоны в дефолтном UI (в custom-UI зону рисует слот). */
export const zonePaddings: Record<GrFileUploadSize, string> = {
  xs: 'px-3 py-3',
  sm: 'px-4 py-4',
  md: 'px-5 py-6',
  lg: 'px-6 py-8',
}

/** Плитка с иконкой слева от подписи. */
export const iconTileSizes: Record<GrFileUploadSize, string> = {
  xs: 'h-8 w-8 rounded-[8px]',
  sm: 'h-10 w-10 rounded-[10px]',
  md: 'h-12 w-12 rounded-[12px]',
  lg: 'h-14 w-14 rounded-[14px]',
}

/**
 * Глиф в плитке задаётся пикселями, а не шкалой `GrIcon`: та упирается в 20px,
 * а плитке нужны 24px на `md`. Явное значение обязательно — без него иконка
 * читала бы размер прямо из `GrConfigProvider` и разъезжалась с самой зоной,
 * когда размер задан точечно через `componentDefaults`.
 */
export const iconGlyphSizes: Record<GrFileUploadSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
}

export const labelSizes: Record<GrFileUploadSize, string> = {
  xs: 'text-[12px]',
  sm: 'text-[13px]',
  md: 'text-[14px]',
  lg: 'text-base',
}

/** Подсказка, список файлов и текст прогресса — мельче основной подписи. */
export const hintSizes: Record<GrFileUploadSize, string> = {
  xs: 'text-[11px]',
  sm: 'text-[12px]',
  md: 'text-[13px]',
  lg: 'text-sm',
}

export const progressTextSizes: Record<GrFileUploadSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-[11px]',
  md: 'text-[12px]',
  lg: 'text-[13px]',
}

export const zoneGaps: Record<GrFileUploadSize, string> = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-5',
}

/** Полоса прогресса берёт толщину из шкалы `GrProgressBar`. */
export const progressBarSizes: Record<GrFileUploadSize, GrComponentSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}
