import type { GrNumberInputSize } from './grNumberInputStyles'

/**
 * Пропы `GrNumberInput`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrNumberInput: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrNumberInputConfigurableProps {
  size: GrNumberInputSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrNumberInput: GrNumberInputConfigurableProps
  }
}
