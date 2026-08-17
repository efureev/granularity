import type { GrCardHeadingLevel, GrCardPadding, GrCardVariant } from './grCardStyles'

/**
 * Пропы `GrCard`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrCard: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrCardConfigurableProps {
  padding: GrCardPadding
  variant: GrCardVariant
  headingLevel: GrCardHeadingLevel
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrCard: GrCardConfigurableProps
  }
}
