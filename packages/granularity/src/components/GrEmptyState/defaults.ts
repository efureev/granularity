import type { GrEmptyStateHeadingLevel, GrEmptyStateSize, GrEmptyStateVariant } from './grEmptyStateStyles'

/**
 * Пропы `GrEmptyState`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrEmptyState: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrEmptyStateConfigurableProps {
  size: GrEmptyStateSize
  variant: GrEmptyStateVariant
  headingLevel: GrEmptyStateHeadingLevel
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrEmptyState: GrEmptyStateConfigurableProps
  }
}
