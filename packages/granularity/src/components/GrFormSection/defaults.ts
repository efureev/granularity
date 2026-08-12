import type { GrFormSectionHeadingLevel } from './grFormSectionStyles'

/**
 * Пропы `GrFormSection`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrFormSection: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrFormSectionConfigurableProps {
  headingLevel: GrFormSectionHeadingLevel
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrFormSection: GrFormSectionConfigurableProps
  }
}
