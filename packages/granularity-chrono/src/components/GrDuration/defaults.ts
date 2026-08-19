import type { NameWidth } from '../../chrono/chronoFormat'
import type { DurationUnit } from '../../chrono/duration'

/**
 * Пропы `GrDuration`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrDuration: { … } }">`.
 *
 * Ровно то, что задают один раз на приложение: подробность и длина имён
 * единиц. Само значение — всегда на месте.
 */
export interface GrDurationConfigurableProps {
  width: NameWidth
  maxUnits: number
  largestUnit: DurationUnit
  smallestUnit: DurationUnit
  live: boolean
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDuration: GrDurationConfigurableProps
  }
}
