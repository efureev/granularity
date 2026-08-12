import type { NameWidth } from '../../chrono/chronoFormat'

/**
 * Пропы `GrRelativeTime`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrRelativeTime: { … } }">`.
 *
 * Ровно то, что задают один раз на приложение: вид строки и порог перехода к
 * абсолютной дате. Само значение и то, с чем его сравнивают, — всегда на месте.
 */
export interface GrRelativeTimeConfigurableProps {
  width: NameWidth
  numeric: Intl.RelativeTimeFormatNumeric
  cutoff: number
  live: boolean
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrRelativeTime: GrRelativeTimeConfigurableProps
  }
}
