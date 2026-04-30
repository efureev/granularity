import type { GrInputSize } from '../GrInput/GrInput.vue'
export type GrInputTagSize = GrInputSize
export type GrInputTagState = 'default' | 'success' | 'warning' | 'danger'
export const wrapperSizeClassBySize: Record<GrInputTagSize, string> = {
  xs: 'min-h-7 px-2.5 py-1 gap-1.5',
  sm: 'min-h-8 px-3 py-1 gap-1.5',
  md: 'min-h-10 px-3 py-1.5 gap-2',
  lg: 'min-h-11 px-4 py-2 gap-2',
}
export const inputSizeClassBySize: Record<GrInputTagSize, string> = {
  xs: 'text-[12px]',
  sm: 'text-[13px]',
  md: 'text-[14px]',
  lg: 'text-[16px]',
}
export const wrapperBorderClassByState: Record<GrInputTagState, string> = {
  default: 'border-[var(--brd)]',
  success: 'border-[var(--ds-success)] focus-within:ring-[var(--ds-success)]',
  warning: 'border-[var(--ds-warning)] focus-within:ring-[var(--ds-warning)]',
  danger: 'border-[var(--ds-danger)] focus-within:ring-[var(--ds-danger)]',
}
export function grInputTagWrapperClass(options: { size: GrInputTagSize, state: GrInputTagState, invalid: boolean, disabled: boolean }): string {
  return [
    wrapperSizeClassBySize[options.size],
    options.invalid ? wrapperBorderClassByState.danger : wrapperBorderClassByState[options.state],
    options.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text',
  ].join(' ')
}
export function grInputTagInputClass(size: GrInputTagSize): string {
  return inputSizeClassBySize[size]
}
