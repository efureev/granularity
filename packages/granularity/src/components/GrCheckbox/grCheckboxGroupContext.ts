import type { ComputedRef, InjectionKey } from 'vue'

import type { GrCheckboxSize } from './grCheckboxStyles'

export type GrCheckboxGroupContext = {
  /** Выбранные значения группы. Чекбокс сравнивает с ними свой `value`. */
  modelValue: ComputedRef<string[]>
  name: ComputedRef<string | undefined>
  disabled: ComputedRef<boolean>
  readonly: ComputedRef<boolean>
  invalid: ComputedRef<boolean>
  /**
   * Обязательность группы объявляют её чекбоксы: `role="group"` не поддерживает
   * `aria-required` (axe: `aria-allowed-attr`), а `role="checkbox"` — да.
   */
  required: ComputedRef<boolean>
  size: ComputedRef<GrCheckboxSize>
  /** Добавляет или убирает значение из выбранных. */
  toggle: (value: string, checked: boolean) => void
}

export const GR_CHECKBOX_GROUP_CONTEXT: InjectionKey<GrCheckboxGroupContext> = Symbol('GR_CHECKBOX_GROUP_CONTEXT')
