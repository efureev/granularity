import { splitClassTokens } from '../shared/classTokens'

export type DsProgressBarTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'slate' | 'azure'

function withVar(token: string): string {
  return `[${token}]`
}

const toneVars: Record<DsProgressBarTone, string> = {
  primary: 'var(--pb-bg,var(--primary))',
  neutral: 'var(--pb-neutral-bg,var(--secondary))',
  success: 'var(--pb-success-bg,var(--ds-success))',
  warning: 'var(--pb-warning-bg,var(--ds-warning))',
  danger: 'var(--pb-danger-bg,var(--ds-danger))',
  info: 'var(--pb-info-bg,var(--ds-info))',
  slate: 'var(--pb-slate-bg,var(--ds-slate))',
  azure: 'var(--pb-azure-bg,var(--ds-azure))',
}

export function dsProgressBarFillClass(tone: DsProgressBarTone): string {
  return `bg-${withVar(toneVars[tone])}`
}

const fillTokens = (Object.keys(toneVars) as DsProgressBarTone[]).flatMap(tone =>
  splitClassTokens(dsProgressBarFillClass(tone)),
)

export const dsProgressBarClassTokens = {
  fill: fillTokens,
} as const

export const dsProgressBarSafelist = [...new Set([
  ...dsProgressBarClassTokens.fill,
])] as const