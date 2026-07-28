import type { GrSelectSize } from './grSelectStyles'

/**
 * Пропы `GrSelect`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrSelect: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrSelectConfigurableProps {
  size: GrSelectSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrSelect: GrSelectConfigurableProps
  }
}
