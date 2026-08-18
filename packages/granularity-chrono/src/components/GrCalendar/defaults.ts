import type { IsoWeekday } from '../../chrono/plainDate'
import type { GrCalendarSize } from './grCalendarStyles'

/**
 * Пропы `GrCalendar`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrCalendar: { … } }">`.
 *
 * `weekStart` живёт здесь, а не у каждого пикера: календарь один на всех, и
 * первый день недели — свойство приложения, а не отдельного поля. Настройка
 * под ключом `GrCalendar` доезжает и до `GrDatePicker`, и до диапазона, и до
 * даты со временем, потому что панель у них общая.
 */
export interface GrCalendarConfigurableProps {
  size: GrCalendarSize
  showWeekNumbers: boolean
  weekStart: IsoWeekday
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrCalendar: GrCalendarConfigurableProps
  }
}
