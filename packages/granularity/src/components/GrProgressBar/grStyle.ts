import type { GrTone } from '../shared/tones'

export type GrProgressBarTone = GrTone

function withVar(token: string): string {
  return `[${token}]`
}

const toneVars: Record<GrProgressBarTone, string> = {
  primary: 'var(--pb-bg,var(--gr-primary))',
  neutral: 'var(--pb-neutral-bg,var(--gr-secondary))',
  success: 'var(--pb-success-bg,var(--gr-success))',
  warning: 'var(--pb-warning-bg,var(--gr-warning))',
  danger: 'var(--pb-danger-bg,var(--gr-danger))',
  info: 'var(--pb-info-bg,var(--gr-info))',
  slate: 'var(--pb-slate-bg,var(--gr-slate))',
  azure: 'var(--pb-azure-bg,var(--gr-azure))',
}

export function grProgressBarFillClass(tone: GrProgressBarTone): string {
  return `bg-${withVar(toneVars[tone])}`
}
