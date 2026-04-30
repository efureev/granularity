export type GrNumberInputState = 'default' | 'success' | 'warning' | 'danger'
export type GrNumberInputSize = 'xs' | 'sm' | 'md' | 'lg'
export type GrNumberInputControlsDirection = 'vertical' | 'horizontal'
export type GrNumberInputTextAlign = 'left' | 'center' | 'right'

// Backward-compatible type aliases.
export type NumberInputSize = GrNumberInputSize
export type NumberInputControlsDirection = GrNumberInputControlsDirection

export const sizeClassBySize: Record<GrNumberInputSize, string> = {
  xs: 'h-7 px-2.5 text-[12px]',
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-3 text-[14px]',
  lg: 'h-11 px-4 text-[16px]',
}

export const textAlignClassByAlign: Record<GrNumberInputTextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export const borderClassByState: Record<GrNumberInputState, string> = {
  default: 'border-[var(--brd)]',
  success: 'border-[var(--ds-success)] focus-within:ring-[var(--ds-success)]',
  warning: 'border-[var(--ds-warning)] focus-within:ring-[var(--ds-warning)]',
  danger: 'border-[var(--ds-danger)] focus-within:ring-[var(--ds-danger)]',
}

/** Динамические классы для disabled-состояния shell'а — выбираются в рантайме. */
export const disabledShellClass = 'opacity-50 cursor-not-allowed'

export function grNumberInputShellClass(options: { disabled: boolean, state: GrNumberInputState }): string {
  return [
    options.disabled ? disabledShellClass : '',
    borderClassByState[options.state],
  ]
    .filter(Boolean)
    .join(' ')
}

export function grNumberInputInputClass(options: { size: GrNumberInputSize, textAlign: GrNumberInputTextAlign }): string {
  return [
    sizeClassBySize[options.size],
    textAlignClassByAlign[options.textAlign],
  ].join(' ')
}
