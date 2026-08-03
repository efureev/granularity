import type { ComputedRef, InjectionKey } from 'vue'

import type { GrButtonSize } from '../GrButton/grButtonStyles'

export type GrRadioEntry = {
  value: () => string
  disabled: () => boolean
}

export type GrRadioGroupContext = {
  modelValue: ComputedRef<string>
  name: ComputedRef<string | undefined>
  disabled: ComputedRef<boolean>
  size: ComputedRef<GrButtonSize>
  setValue: (value: string) => void
  /**
   * Регистрация переключателя в группе. Порядок регистрации совпадает с
   * порядком в документе (setup детей идёт сверху вниз), поэтому группа знает
   * состав и в slot-режиме, и на сервере — без обхода DOM.
   */
  register: (entry: GrRadioEntry) => () => void
  /**
   * Значение переключателя, который держит `tabindex="0"`. Roving tabindex
   * WAI-ARIA: группа — одна остановка Tab, внутрь попадают стрелками. Если не
   * выбрано ничего, остановкой становится первый доступный переключатель.
   */
  rovingValue: ComputedRef<string | undefined>
  /** Переводит выбор на соседний доступный переключатель (стрелки). */
  moveSelection: (from: string, direction: 1 | -1) => string | undefined
}

export const GR_RADIO_GROUP_CONTEXT: InjectionKey<GrRadioGroupContext> = Symbol('GR_RADIO_GROUP_CONTEXT')