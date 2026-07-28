import type { GrAutocompleteSize } from './grAutocompleteStyles'

/**
 * Пропы `GrAutocomplete`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrAutocomplete: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrAutocompleteConfigurableProps {
  size: GrAutocompleteSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrAutocomplete: GrAutocompleteConfigurableProps
  }
}
