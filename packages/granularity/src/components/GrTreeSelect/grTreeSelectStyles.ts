import type { GrControlState } from '../shared/sizes'

import type { GrInputSize } from '../GrInput'

export type GrTreeSelectState = GrControlState

export const sizeClassBySize: Record<GrInputSize, string> = {
  xs: 'h-7 px-2.5 text-[12px]',
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-3 text-[14px]',
  lg: 'h-11 px-4 text-[16px]',
}

export const borderClassByState: Record<GrTreeSelectState, string> = {
  default: 'border-[var(--gr-brd)]',
  success: 'border-[var(--gr-success)] focus-visible:ring-[var(--gr-success)]',
  warning: 'border-[var(--gr-warning)] focus-visible:ring-[var(--gr-warning)]',
  danger: 'border-[var(--gr-danger)] focus-visible:ring-[var(--gr-danger)]',
}

/**
 * Disabled красится фоном и цветом текста, а не прозрачностью: `opacity`
 * разбавляет выверенные на AA токены и роняет контраст подписи.
 */
export const shellEnabledClass = 'bg-[var(--gr-bg)] text-[var(--gr-fg)]'
export const shellDisabledClass = 'bg-[var(--gr-muted)] text-[var(--gr-muted-fg)] cursor-not-allowed'

export function grTreeSelectClass(options: {
  size: GrInputSize
  state: GrTreeSelectState
  invalid: boolean
  disabled?: boolean
}): string {
  return [
    sizeClassBySize[options.size],
    'pr-9',
    options.disabled ? shellDisabledClass : shellEnabledClass,
    options.invalid ? borderClassByState.danger : borderClassByState[options.state],
  ].join(' ')
}

export const grTreeSelectPanelClass = 'rounded-[var(--gr-radius-xl)] border border-[var(--gr-brd)] bg-[var(--gr-card)] text-[var(--gr-card-fg)] shadow-[var(--gr-shadow-2)] overflow-hidden'
