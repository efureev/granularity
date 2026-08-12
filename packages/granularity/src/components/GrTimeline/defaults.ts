import type { GrTimelineHeadingLevel } from './grTimelineContext'
import type { GrTimelineDensity, GrTimelineLayout, GrTimelineOrientation } from './grTimelineStyles'

/**
 * Пропы `GrTimeline`, настраиваемые глобально через `componentDefaults`.
 *
 * Только оформление: данные, группировка и состояние загрузки принадлежат
 * конкретному экземпляру.
 */
export interface GrTimelineConfigurableProps {
  layout: GrTimelineLayout
  orientation: GrTimelineOrientation
  density: GrTimelineDensity
  groupHeadingLevel: GrTimelineHeadingLevel
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrTimeline: GrTimelineConfigurableProps
  }
}
