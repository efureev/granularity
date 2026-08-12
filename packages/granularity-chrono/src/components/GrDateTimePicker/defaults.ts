import type { UseFloatingPlacement } from '@feugene/granularity/composables/useFloating'

import type { GrDateTimePickerSize } from './grDateTimePickerStyles'

/**
 * Пропы `GrDateTimePicker`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrDateTimePicker: { … } }">`.
 */
export interface GrDateTimePickerConfigurableProps {
  size: GrDateTimePickerSize
  clearable: boolean
  placement: UseFloatingPlacement
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDateTimePicker: GrDateTimePickerConfigurableProps
  }
}
