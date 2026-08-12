import type { GrCalendarSize } from './grCalendarStyles'

/**
 * Пропы `GrCalendar`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrCalendar: { … } }">`.
 * Только оформление: поведение календаря настраивается на месте.
 */
export interface GrCalendarConfigurableProps {
  size: GrCalendarSize
  showWeekNumbers: boolean
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrCalendar: GrCalendarConfigurableProps
  }
}
