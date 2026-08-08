import type { GrComponentSize, GrControlState } from '../shared/sizes'


export type GrNumberInputState = GrControlState
export type GrNumberInputSize = GrComponentSize
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
  default: 'border-[var(--gr-brd)]',
  success: 'border-[var(--gr-success)] focus-within:ring-[var(--gr-success)]',
  warning: 'border-[var(--gr-warning)] focus-within:ring-[var(--gr-warning)]',
  danger: 'border-[var(--gr-danger)] focus-within:ring-[var(--gr-danger)]',
}

/**
 * Недоступное поле гасится токенами, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены текста и роняет контраст подписи.
 */
export const disabledShellClass = 'bg-[var(--gr-disabled-bg)] text-[var(--gr-disabled-fg)] cursor-not-allowed'

const stepperBaseClass = 'inline-flex items-center justify-center text-[var(--gr-muted-fg)] hover:bg-[var(--gr-muted)] active:bg-[var(--gr-muted)] disabled:cursor-not-allowed disabled:text-[var(--gr-disabled-fg)] disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

/** Компактная кнопка вертикального стека ± . */
export const stepperCompactClass = `h-4 w-7 rounded ${stepperBaseClass}`

/** Кнопка бокового стека ± — занимает всю высоту поля. */
export const stepperWideClass = `h-full w-full ${stepperBaseClass}`

export const clearButtonClass = 'absolute top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[var(--gr-muted-fg)] hover:bg-[var(--gr-muted)] hover:text-[var(--gr-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

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
