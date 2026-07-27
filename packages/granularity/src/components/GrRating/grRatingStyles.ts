import type { GrTone } from '../shared/tones'

export type GrRatingSize = 'sm' | 'md' | 'lg'
export type GrRatingTone = GrTone

/**
 * Кастомизация через CSS-переменные (на самом компоненте или любом предке):
 *
 * - `--gr-rating-color`      — цвет «залитых» символов (по умолчанию — из `tone`).
 * - `--gr-rating-void-color` — цвет «пустых» символов.
 * - `--gr-rating-symbol-size` — размер символа (по умолчанию — из `size`).
 */

// Размер символа — дефолт для `--gr-rating-symbol-size`.
export const ratingSymbolSizeBySize: Record<GrRatingSize, string> = {
  sm: 'h-[var(--gr-rating-symbol-size,1rem)] w-[var(--gr-rating-symbol-size,1rem)]',
  md: 'h-[var(--gr-rating-symbol-size,1.25rem)] w-[var(--gr-rating-symbol-size,1.25rem)]',
  lg: 'h-[var(--gr-rating-symbol-size,1.5rem)] w-[var(--gr-rating-symbol-size,1.5rem)]',
}

export const ratingGapBySize: Record<GrRatingSize, string> = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1.5',
}

export const ratingTextSizeBySize: Record<GrRatingSize, string> = {
  sm: 'text-[12px]',
  md: 'text-[13px]',
  lg: 'text-[15px]',
}

// Цвет заливки по тону. `--gr-rating-color` перекрывает тон точечно.
export const ratingFillClassByTone: Record<GrRatingTone, string> = {
  primary: 'text-[var(--gr-rating-color,var(--gr-primary))]',
  neutral: 'text-[var(--gr-rating-color,var(--gr-fg))]',
  success: 'text-[var(--gr-rating-color,var(--gr-success))]',
  warning: 'text-[var(--gr-rating-color,var(--gr-warning))]',
  danger: 'text-[var(--gr-rating-color,var(--gr-danger))]',
  info: 'text-[var(--gr-rating-color,var(--gr-info))]',
  slate: 'text-[var(--gr-rating-color,var(--gr-slate))]',
  azure: 'text-[var(--gr-rating-color,var(--gr-azure))]',
}

// «Пустой» символ: приглушённая заливка, чтобы шкала читалась целиком.
export const ratingVoidClass = 'text-[var(--gr-rating-void-color,color-mix(in_srgb,var(--gr-muted-fg)_35%,transparent))]'

export function ratingRootClass(options: { size: GrRatingSize, disabled: boolean, interactive: boolean }): string {
  return [
    'inline-flex items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gr-bg)]',
    ratingGapBySize[options.size],
    options.disabled ? 'cursor-not-allowed opacity-50' : (options.interactive ? 'cursor-pointer' : ''),
  ]
    .filter(Boolean)
    .join(' ')
}

export function ratingSymbolClass(size: GrRatingSize): string {
  return `relative block shrink-0 ${ratingSymbolSizeBySize[size]}`
}
