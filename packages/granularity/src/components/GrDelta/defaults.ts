import type { GrComponentSize } from '../shared/sizes'

import type { GrDeltaPolarity } from './deltaTone'

/**
 * Пропы `GrDelta`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrDelta: { … } }">`.
 *
 * `polarity` здесь наравне с оформлением не случайно: в отчёте по расходам
 * «рост — плохо» верно для всех величин сразу, и повторять это на каждой
 * значит однажды забыть.
 */
export interface GrDeltaConfigurableProps {
  size: GrComponentSize
  polarity: GrDeltaPolarity
  showSign: boolean
  showArrow: boolean
  emptyText: string
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDelta: GrDeltaConfigurableProps
  }
}
