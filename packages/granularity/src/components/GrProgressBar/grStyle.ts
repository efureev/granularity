export type GrProgressBarTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'slate' | 'azure'

function withVar(token: string): string {
  return `[${token}]`
}

const toneVars: Record<GrProgressBarTone, string> = {
  primary: 'var(--pb-bg,var(--primary))',
  neutral: 'var(--pb-neutral-bg,var(--secondary))',
  success: 'var(--pb-success-bg,var(--ds-success))',
  warning: 'var(--pb-warning-bg,var(--ds-warning))',
  danger: 'var(--pb-danger-bg,var(--ds-danger))',
  info: 'var(--pb-info-bg,var(--ds-info))',
  slate: 'var(--pb-slate-bg,var(--ds-slate))',
  azure: 'var(--pb-azure-bg,var(--ds-azure))',
}

export function grProgressBarFillClass(tone: GrProgressBarTone): string {
  return `bg-${withVar(toneVars[tone])}`
}
