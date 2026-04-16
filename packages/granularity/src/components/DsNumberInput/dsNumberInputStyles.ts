import { splitClassTokens } from '../shared/classTokens'

export type DsNumberInputState = 'default' | 'success' | 'warning' | 'danger'
export type DsNumberInputSize = 'xs' | 'sm' | 'md' | 'lg'
export type DsNumberInputControlsDirection = 'vertical' | 'horizontal'
export type DsNumberInputTextAlign = 'left' | 'center' | 'right'

// Backward-compatible type aliases.
export type NumberInputSize = DsNumberInputSize
export type NumberInputControlsDirection = DsNumberInputControlsDirection

const shellBase =
  'relative w-full overflow-hidden rounded-md border bg-[var(--bg)] transition-colors duration-150 focus-within:ring-2 focus-within:ring-[var(--ring)]'

const inputBase =
  'w-full bg-transparent text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:placeholder:text-transparent focus:outline-none disabled:cursor-not-allowed'

const templateStaticTokens = [
  'absolute inset-y-0 left-0 flex items-center justify-center border-r border-[var(--brd)] px-2 text-[var(--muted-fg)] pointer-events-none select-none truncate',
  'absolute inset-y-0 flex items-center justify-center border-l border-[var(--brd)] px-2 text-[var(--muted-fg)] pointer-events-none select-none truncate',
  'absolute inset-y-0 flex items-center justify-center border-l border-[var(--brd)]',
  'flex flex-col justify-center gap-1',
  'h-4 w-7 inline-flex items-center justify-center rounded text-[10px] text-[var(--muted-fg)] hover:bg-[var(--muted)] active:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed',
  'absolute inset-y-0 flex items-stretch justify-center border-r border-[var(--brd)]',
  'h-full w-full inline-flex items-center justify-center text-[var(--muted-fg)] hover:bg-[var(--muted)] active:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
  'absolute inset-y-0 flex items-stretch justify-center border-l border-[var(--brd)]',
]

const sizeClassBySize: Record<DsNumberInputSize, string> = {
  xs: 'h-7 px-2.5 text-[12px]',
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-3 text-[14px]',
  lg: 'h-11 px-4 text-[16px]',
}

const textAlignClassByAlign: Record<DsNumberInputTextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const borderClassByState: Record<DsNumberInputState, string> = {
  default: 'border-[var(--brd)]',
  success: 'border-[var(--ds-success)] focus-within:ring-[var(--ds-success)]',
  warning: 'border-[var(--ds-warning)] focus-within:ring-[var(--ds-warning)]',
  danger: 'border-[var(--ds-danger)] focus-within:ring-[var(--ds-danger)]',
}

export function dsNumberInputShellClass(options: { disabled: boolean, state: DsNumberInputState }): string {
  return [
    options.disabled ? 'opacity-50 cursor-not-allowed' : '',
    borderClassByState[options.state],
  ]
    .filter(Boolean)
    .join(' ')
}

export function dsNumberInputInputClass(options: { size: DsNumberInputSize, textAlign: DsNumberInputTextAlign }): string {
  return [
    sizeClassBySize[options.size],
    textAlignClassByAlign[options.textAlign],
  ].join(' ')
}

export const dsNumberInputSafelist = [...new Set([
  ...splitClassTokens(shellBase),
  ...splitClassTokens(inputBase),
  ...Object.values(sizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(textAlignClassByAlign).flatMap(splitClassTokens),
  ...Object.values(borderClassByState).flatMap(splitClassTokens),
  ...splitClassTokens('opacity-50 cursor-not-allowed'),
  ...templateStaticTokens.flatMap(splitClassTokens),
])]