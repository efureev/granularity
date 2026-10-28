import { componentSheet, lookElement as element } from '@feugene/granularity-test-kit/vue'
import { grButtonLookAttrs, type GrButtonLookOptions } from '../grButtonStyles'

export type { SheetState as ButtonState } from '@feugene/granularity-test-kit/vue'

export const { cascade, look } = componentSheet('GrButton/GrButton.vue')

/** Кнопка без монтирования — элемент с атрибутами вида. */
export function lookElement(options: GrButtonLookOptions & { pressed?: boolean, disabled?: boolean }): HTMLElement {
  const button = element('button', { 'data-gr-button': '', ...grButtonLookAttrs(options), 'data-gr-pressed': options.pressed ? '' : undefined })
  if (options.disabled)
    (button as HTMLButtonElement).disabled = true
  return button
}
