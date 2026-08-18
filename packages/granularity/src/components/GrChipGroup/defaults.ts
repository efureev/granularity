import type { GrChipSize } from '../GrChip/grChipStyles'

/**
 * Пропы `GrChipGroup`, настраиваемые глобально через `componentDefaults`.
 * Размер группы доезжает до чипов контекстом — задавать его на каждом не нужно.
 */
export interface GrChipGroupConfigurableProps {
  size: GrChipSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrChipGroup: GrChipGroupConfigurableProps
  }
}
