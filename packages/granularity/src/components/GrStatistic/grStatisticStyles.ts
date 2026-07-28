import type { GrTone } from '../shared/tones'

export type GrStatisticSize = 'sm' | 'md' | 'lg'
export type GrStatisticTone = GrTone
/** Направление динамики показателя. */
export type GrStatisticTrend = 'up' | 'down' | 'flat'

/**
 * Кастомизация через CSS-переменные:
 *
 * - `--gr-statistic-value-color` — цвет значения (по умолчанию — из `tone`).
 * - `--gr-statistic-title-color` — цвет подписи показателя.
 */

export const statisticTitleSizeBySize: Record<GrStatisticSize, string> = {
  sm: 'text-[11px]',
  md: 'text-[12px]',
  lg: 'text-[13px]',
}

export const statisticValueSizeBySize: Record<GrStatisticSize, string> = {
  sm: 'text-[20px] leading-7',
  md: 'text-[28px] leading-9',
  lg: 'text-[36px] leading-tight',
}

export const statisticAffixSizeBySize: Record<GrStatisticSize, string> = {
  sm: 'text-[13px]',
  md: 'text-[16px]',
  lg: 'text-[20px]',
}

// Высота плейсхолдера загрузки повторяет строку значения — блок не «прыгает».
// Значение отдаётся в `GrSkeleton` пропом, поэтому это px, а не класс.
export const statisticPlaceholderHeightBySize: Record<GrStatisticSize, string> = {
  sm: '28px',
  md: '36px',
  lg: '44px',
}

export const statisticTrendSizeBySize: Record<GrStatisticSize, string> = {
  sm: 'text-[11px]',
  md: 'text-[12px]',
  lg: 'text-[13px]',
}

// Цвет значения по тону. `neutral` наследует основной цвет текста.
//
// Тона берутся из `-text`, а не из насыщенного `--gr-{tone}`: значение — это
// ТЕКСТ на фоне страницы, а насыщенный тон для этого не предназначен
// (`--gr-success` на `--gr-bg` — 2.2:1, ниже даже послабления 3:1 для крупного
// текста). `-text` — ровно роль «тон как текст».
export const statisticValueClassByTone: Record<GrStatisticTone, string> = {
  neutral: 'text-[var(--gr-statistic-value-color,var(--gr-fg))]',
  primary: 'text-[var(--gr-statistic-value-color,var(--gr-primary))]',
  success: 'text-[var(--gr-statistic-value-color,var(--gr-success-text))]',
  warning: 'text-[var(--gr-statistic-value-color,var(--gr-warning-text))]',
  danger: 'text-[var(--gr-statistic-value-color,var(--gr-danger-text))]',
  info: 'text-[var(--gr-statistic-value-color,var(--gr-info-text))]',
  slate: 'text-[var(--gr-statistic-value-color,var(--gr-slate-text))]',
  azure: 'text-[var(--gr-statistic-value-color,var(--gr-azure-text))]',
}

// Строка динамики: рост — успех, падение — опасность, без изменений — приглушённый.
export const statisticTrendClassByTrend: Record<GrStatisticTrend, string> = {
  up: 'text-[var(--gr-success-text)]',
  down: 'text-[var(--gr-danger-text)]',
  flat: 'text-[var(--gr-muted-fg)]',
}

export const statisticTrendIconByTrend: Record<GrStatisticTrend, string> = {
  up: 'i-lucide-trending-up',
  down: 'i-lucide-trending-down',
  flat: 'i-lucide-minus',
}

export const statisticTitleClass = 'font-medium tracking-wide text-[var(--gr-statistic-title-color,var(--gr-muted-fg))]'

export function statisticValueClass(options: { size: GrStatisticSize, tone: GrStatisticTone }): string {
  return [
    'font-semibold [font-variant-numeric:tabular-nums]',
    statisticValueSizeBySize[options.size],
    statisticValueClassByTone[options.tone],
  ].join(' ')
}
