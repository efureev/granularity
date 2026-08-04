import type { GrComponentSize } from '../shared/sizes'
import type { GrTone } from '../shared/tones'

export type GrProgressBarTone = GrTone
export type GrProgressBarSize = GrComponentSize

/**
 * Размер линейного индикатора — это толщина трека и ничего больше: ширину
 * задаёт контейнер, а текста у компонента нет.
 */
export const trackSizes: Record<GrProgressBarSize, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

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
