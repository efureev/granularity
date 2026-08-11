import type { ComputedRef, InjectionKey } from 'vue'

import type { GrTimelineDensity, GrTimelineLayout, GrTimelineOrientation } from './grTimelineStyles'

/**
 * Уровень заголовка группы. Тот же довод, что у `GrCollapse`: лента в разделе
 * `<h4>` с захардкоженным `<h3>` рвёт навигацию по заголовкам.
 */
export const GR_TIMELINE_HEADING_LEVELS = [2, 3, 4, 5, 6] as const

export type GrTimelineHeadingLevel = typeof GR_TIMELINE_HEADING_LEVELS[number]

/**
 * Пункт читает раскладку из контейнера, а не получает её пропом: иначе
 * `layout` пришлось бы дублировать на каждом `GrTimelineItem`.
 */
export interface GrTimelineContext {
  layout: ComputedRef<GrTimelineLayout>
  orientation: ComputedRef<GrTimelineOrientation>
  density: ComputedRef<GrTimelineDensity>
}

export const GR_TIMELINE_CONTEXT: InjectionKey<GrTimelineContext> = Symbol('GR_TIMELINE_CONTEXT')
