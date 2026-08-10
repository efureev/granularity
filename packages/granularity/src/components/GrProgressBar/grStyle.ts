import type { GrComponentSize } from '../shared/sizes'
import type { GrTone } from '../shared/tones'

export type GrProgressBarTone = GrTone
export type GrProgressBarSize = GrComponentSize

/**
 * Размер линейного индикатора — это толщина трека: ширину задаёт контейнер.
 */
export const trackSizes: Record<GrProgressBarSize, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

/** Зазор между треком и подписью значения. */
export const rowGaps: Record<GrProgressBarSize, string> = {
  xs: 'gap-2',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-3',
}

export const valueTextSizes: Record<GrProgressBarSize, string> = {
  xs: 'text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-tight)]',
  sm: 'text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-tight)]',
  md: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-tight)]',
  lg: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-tight)]',
}

/**
 * Буфер не наследует тон: `-light`-роли есть не у всех восьми тонов, а
 * нейтральный слой между треком и заливкой читается и без цвета тона.
 */
export const bufferClass = 'bg-[var(--gr-progress-buffer-bg,var(--gr-brd))]'

function withVar(token: string): string {
  return `[${token}]`
}

const toneVars: Record<GrProgressBarTone, string> = {
  primary: 'var(--gr-progress-bg,var(--gr-primary))',
  neutral: 'var(--gr-progress-neutral-bg,var(--gr-secondary))',
  success: 'var(--gr-progress-success-bg,var(--gr-success))',
  warning: 'var(--gr-progress-warning-bg,var(--gr-warning))',
  danger: 'var(--gr-progress-danger-bg,var(--gr-danger))',
  info: 'var(--gr-progress-info-bg,var(--gr-info))',
  slate: 'var(--gr-progress-slate-bg,var(--gr-slate))',
  azure: 'var(--gr-progress-azure-bg,var(--gr-azure))',
}

export function grProgressBarFillClass(tone: GrProgressBarTone): string {
  return `bg-${withVar(toneVars[tone])}`
}
