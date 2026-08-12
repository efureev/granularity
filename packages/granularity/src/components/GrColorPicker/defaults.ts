import type { GrColorPickerSize } from './grColorPickerStyles'

/**
 * Пропы `GrColorPicker`, настраиваемые глобально через `componentDefaults`.
 *
 * Только оформление: значение, пресеты и состояние панели принадлежат
 * конкретному экземпляру.
 */
export interface GrColorPickerConfigurableProps {
  size: GrColorPickerSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrColorPicker: GrColorPickerConfigurableProps
  }
}
