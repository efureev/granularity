import type { GrDeltaPolarity } from '../GrDelta/deltaTone'

import type { GrStatisticSize } from './grStatisticStyles'

/**
 * Пропы `GrStatistic`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrStatistic: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 *
 * `polarity` здесь по той же причине, что и у `GrDelta`: на дашборде расходов
 * «рост — плохо» верно сразу для всех плиток ряда, и повторять это на каждой
 * значит однажды пропустить одну.
 */
export interface GrStatisticConfigurableProps {
  size: GrStatisticSize
  polarity: GrDeltaPolarity
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrStatistic: GrStatisticConfigurableProps
  }
}
