import type { GrControlShape } from '../shared/controlShape'

import type { GrColorPickerSize, GrColorPickerView } from './grColorPickerStyles'

/**
 * Пропы `GrColorPicker`, настраиваемые глобально через `componentDefaults`.
 *
 * Только оформление: значение, пресеты и состояние панели принадлежат
 * конкретному экземпляру.
 */
export interface GrColorPickerConfigurableProps {
  size: GrColorPickerSize
  /** Форма рамки — см. `components/shared/controlShape.ts`. */
  shape: GrControlShape
  view: GrColorPickerView
  eyedropper: boolean
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrColorPicker: GrColorPickerConfigurableProps
  }
}
