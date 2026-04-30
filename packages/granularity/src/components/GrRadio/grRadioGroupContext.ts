import type { ComputedRef, InjectionKey } from 'vue'

import type { GrButtonSize } from '../GrButton/grButtonStyles'

export type GrRadioGroupContext = {
  modelValue: ComputedRef<string>
  name: ComputedRef<string | undefined>
  disabled: ComputedRef<boolean>
  size: ComputedRef<GrButtonSize>
  setValue: (value: string) => void
}

export const GR_RADIO_GROUP_CONTEXT: InjectionKey<GrRadioGroupContext> = Symbol('GR_RADIO_GROUP_CONTEXT')