import type { GrDividerSpacing, GrDividerVariant } from './grDividerStyles'

/**
 * Пропы `GrDivider`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrDivider: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrDividerConfigurableProps {
  variant: GrDividerVariant
  spacing: GrDividerSpacing
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDivider: GrDividerConfigurableProps
  }
}
