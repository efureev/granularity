import type { UseFloatingPlacement } from '@feugene/granularity/composables/useFloating'

import type { GrDatePickerSize } from './grDatePickerStyles'

/**
 * Пропы `GrDatePicker`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrDatePicker: { … } }">`.
 * Только оформление и поведение оболочки: границы дат задаются на месте.
 */
export interface GrDatePickerConfigurableProps {
  size: GrDatePickerSize
  clearable: boolean
  placement: UseFloatingPlacement
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDatePicker: GrDatePickerConfigurableProps
  }
}
