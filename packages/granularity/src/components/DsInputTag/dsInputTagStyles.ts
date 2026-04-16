import type { DsInputSize } from '../DsInput/DsInput.vue'
import { splitClassTokens } from '../shared/classTokens'

export type DsInputTagSize = DsInputSize
export type DsInputTagState = 'default' | 'success' | 'warning' | 'danger'

const wrapperSizeClassBySize: Record<DsInputTagSize, string> = {
  xs: 'min-h-7 px-2.5 py-1 gap-1.5',
  sm: 'min-h-8 px-3 py-1 gap-1.5',
  md: 'min-h-10 px-3 py-1.5 gap-2',
  lg: 'min-h-11 px-4 py-2 gap-2',
}

const inputSizeClassBySize: Record<DsInputTagSize, string> = {
  xs: 'text-[12px]',
  sm: 'text-[13px]',
  md: 'text-[14px]',
  lg: 'text-[16px]',
}

const wrapperBorderClassByState: Record<DsInputTagState, string> = {
  default: 'border-[var(--brd)]',
  success: 'border-[var(--ds-success)] focus-within:ring-[var(--ds-success)]',
  warning: 'border-[var(--ds-warning)] focus-within:ring-[var(--ds-warning)]',
  danger: 'border-[var(--ds-danger)] focus-within:ring-[var(--ds-danger)]',
}

export function dsInputTagWrapperClass(options: { size: DsInputTagSize, state: DsInputTagState, invalid: boolean, disabled: boolean }): string {
  return [
    wrapperSizeClassBySize[options.size],
    options.invalid ? wrapperBorderClassByState.danger : wrapperBorderClassByState[options.state],
    options.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text',
  ].join(' ')
}

export function dsInputTagInputClass(size: DsInputTagSize): string {
  return inputSizeClassBySize[size]
}

export const dsInputTagSafelist = [...new Set([
  ...Object.values(wrapperSizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(inputSizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(wrapperBorderClassByState).flatMap(splitClassTokens),
  ...splitClassTokens('opacity-50 cursor-not-allowed'),
  ...splitClassTokens('cursor-text'),
])]