import type { GrChipRadius, GrChipSize, GrChipTone } from './grChipStyles'

/**
 * Пропы `GrChip`, настраиваемые глобально через `componentDefaults`.
 * Только оформление: выбор и снятие относятся к экземпляру.
 */
export interface GrChipConfigurableProps {
  tone: GrChipTone
  size: GrChipSize
  radius: GrChipRadius
  dark: boolean
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrChip: GrChipConfigurableProps
  }
}
