import type { GrBadgeRadius, GrBadgeSize, GrBadgeTone } from './grBadgeStyles'

/**
 * Пропы `GrBadge`, настраиваемые глобально через `componentDefaults`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrBadgeConfigurableProps {
  tone: GrBadgeTone
  size: GrBadgeSize
  radius: GrBadgeRadius
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrBadge: GrBadgeConfigurableProps
  }
}
