import type { UseFloatingPlacement } from '@feugene/granularity/composables/useFloating'

import type { GrTimePickerSize } from './grTimePickerStyles'

/**
 * Пропы `GrTimePicker`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrTimePicker: { … } }">`.
 * Только оформление и поведение оболочки: границы времени задаются на месте.
 */
export interface GrTimePickerConfigurableProps {
  size: GrTimePickerSize
  clearable: boolean
  placement: UseFloatingPlacement
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrTimePicker: GrTimePickerConfigurableProps
  }
}
