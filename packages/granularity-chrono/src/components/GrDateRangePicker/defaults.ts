import type { UseFloatingPlacement } from '@feugene/granularity/composables/useFloating'

import type { GrDateRangePickerSize } from './grDateRangePickerStyles'

/**
 * Пропы `GrDateRangePicker`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrDateRangePicker: { … } }">`.
 */
export interface GrDateRangePickerConfigurableProps {
  size: GrDateRangePickerSize
  clearable: boolean
  placement: UseFloatingPlacement
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDateRangePicker: GrDateRangePickerConfigurableProps
  }
}
