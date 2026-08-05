import type { GrCardPadding, GrCardVariant } from './grCardStyles'

/**
 * Пропы `GrCard`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrCard: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrCardConfigurableProps {
  padding: GrCardPadding
  variant: GrCardVariant
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrCard: GrCardConfigurableProps
  }
}
