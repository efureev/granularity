import type { ComputedRef, InjectionKey } from 'vue'

import type { DsButtonSize } from '../DsButton/dsButtonStyles'

export type DsRadioGroupContext = {
  modelValue: ComputedRef<string>
  name: ComputedRef<string | undefined>
  disabled: ComputedRef<boolean>
  size: ComputedRef<DsButtonSize>
  setValue: (value: string) => void
}

export const DS_RADIO_GROUP_CONTEXT: InjectionKey<DsRadioGroupContext> = Symbol('DS_RADIO_GROUP_CONTEXT')