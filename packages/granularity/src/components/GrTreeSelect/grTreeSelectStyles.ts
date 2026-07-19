import type { GrInputSize } from '../GrInput'

export type GrTreeSelectState = 'default' | 'success' | 'warning' | 'danger'

export const sizeClassBySize: Record<GrInputSize, string> = {
  xs: 'h-7 px-2.5 text-[12px]',
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-3 text-[14px]',
  lg: 'h-11 px-4 text-[16px]',
}

export const borderClassByState: Record<GrTreeSelectState, string> = {
  default: 'border-[var(--brd)]',
  success: 'border-[var(--gr-success)] focus-visible:ring-[var(--gr-success)]',
  warning: 'border-[var(--gr-warning)] focus-visible:ring-[var(--gr-warning)]',
  danger: 'border-[var(--gr-danger)] focus-visible:ring-[var(--gr-danger)]',
}

export function grTreeSelectClass(options: { size: GrInputSize, state: GrTreeSelectState, invalid: boolean }): string {
  return [
    sizeClassBySize[options.size],
    'pr-9',
    options.invalid ? borderClassByState.danger : borderClassByState[options.state],
  ].join(' ')
}

export const grTreeSelectPanelClass = 'rounded-[var(--gr-radius-xl)] border border-[var(--brd)] bg-[var(--card)] text-[var(--card-fg)] shadow-[var(--gr-shadow-2)] overflow-hidden'
