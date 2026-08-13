import type { GrDashboardCompaction } from '../../layout'
import type { GrDashboardMode } from './grDashboardStyles'

/**
 * Пропы `GrDashboard`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrDashboard: { … } }">`.
 *
 * Только оформление раскладки и её правила. Сама раскладка глобальной
 * настройкой быть не может по определению — это состояние экземпляра.
 * `mode` исключение осмысленное: «вся админка только для просмотра» — ровно
 * та настройка, которую задают один раз на приложение.
 */
export interface GrDashboardConfigurableProps {
  rowHeight: number
  gap: number
  mode: GrDashboardMode
  draggable: boolean
  resizable: boolean
  compact: GrDashboardCompaction
  preventCollision: boolean
  lazy: boolean
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDashboard: GrDashboardConfigurableProps
  }
}
