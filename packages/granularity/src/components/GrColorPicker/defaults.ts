import type { GrColorPickerSize, GrColorPickerView } from './grColorPickerStyles'

/**
 * Пропы `GrColorPicker`, настраиваемые глобально через `componentDefaults`.
 *
 * Только оформление: значение, пресеты и состояние панели принадлежат
 * конкретному экземпляру.
 */
export interface GrColorPickerConfigurableProps {
  size: GrColorPickerSize
  view: GrColorPickerView
  eyedropper: boolean
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrColorPicker: GrColorPickerConfigurableProps
  }
}
