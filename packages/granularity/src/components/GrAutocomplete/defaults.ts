import type { GrAutocompleteSize } from './grAutocompleteStyles'

/**
 * Пропы `GrAutocomplete`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrAutocomplete: { … } }">`.
 * Только оформление и поведение по умолчанию — см. `GrButton/defaults.ts`.
 */
export interface GrAutocompleteConfigurableProps {
  size: GrAutocompleteSize
  clearable: boolean
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrAutocomplete: GrAutocompleteConfigurableProps
  }
}
