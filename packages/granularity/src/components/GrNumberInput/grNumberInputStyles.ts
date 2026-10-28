import type { GrControlShape } from '../shared/controlShape'
import { controlPillPaddingX, controlPillPaddingXClass } from '../shared/controlShape'

import type { GrComponentSize, GrControlState } from '../shared/sizes'

export type GrNumberInputState = GrControlState
export type GrNumberInputSize = GrComponentSize
export type GrNumberInputControlsDirection = 'vertical' | 'horizontal'
export type GrNumberInputTextAlign = 'left' | 'center' | 'right'

// Backward-compatible type aliases.
export type NumberInputSize = GrNumberInputSize
export type NumberInputControlsDirection = GrNumberInputControlsDirection

export const sizeClassBySize: Record<GrNumberInputSize, string> = {
  xs: 'h-full text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'h-full text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'h-full text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'h-full text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

/** Отступ зависит и от размера, и от формы — см. `shared/controlShape.ts`. */
export const paddingXClass: Record<GrControlShape, Record<GrNumberInputSize, string>> = {
  box: {
    xs: 'px-2.5',
    sm: 'px-3',
    md: 'px-3',
    lg: 'px-4',
  },
  pill: controlPillPaddingXClass,
}

/** То же значением: степперы и аддоны задают отступ инлайн-стилем. */
export const paddingX: Record<GrControlShape, Record<GrNumberInputSize, string>> = {
  box: {
    xs: '10px',
    sm: '12px',
    md: '12px',
    lg: '16px',
  },
  pill: controlPillPaddingX,
}

export const textAlignClassByAlign: Record<GrNumberInputTextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const stepperBaseClass = 'inline-flex items-center justify-center text-[var(--gr-muted-fg)] hover:bg-[var(--gr-muted)] active:bg-[var(--gr-muted)] disabled:cursor-not-allowed disabled:text-[var(--gr-disabled-fg)] disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

/** Компактная кнопка вертикального стека ± . */
export const stepperCompactClass = `h-4 w-7 rounded-[var(--gr-radius-sm)] ${stepperBaseClass}`

/** Кнопка бокового стека ± — занимает всю высоту поля. */
export const stepperWideClass = `h-full w-full ${stepperBaseClass}`

export const clearButtonClass = 'absolute top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-[var(--gr-radius-full)] text-[var(--gr-muted-fg)] hover:bg-[var(--gr-muted)] hover:text-[var(--gr-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export function grNumberInputInputClass(options: {
  size: GrNumberInputSize
  textAlign: GrNumberInputTextAlign
  shape: GrControlShape
}): string {
  return [
    sizeClassBySize[options.size],
    paddingXClass[options.shape][options.size],
    textAlignClassByAlign[options.textAlign],
  ].join(' ')
}
