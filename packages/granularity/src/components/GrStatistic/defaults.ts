import type { GrStatisticSize } from './grStatisticStyles'

/**
 * Пропы `GrStatistic`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrStatistic: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrStatisticConfigurableProps {
  size: GrStatisticSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrStatistic: GrStatisticConfigurableProps
  }
}
