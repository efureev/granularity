import type { ComputedRef, InjectionKey, Ref } from 'vue'

import type { GrSidebarPosition } from './grSidebarStyles'

/**
 * Контекст `GrSidebar`, который потребляют `GrSidebarItem`'ы: свёрнута ли панель.
 * В свёрнутом состоянии пункты показывают только иконку (или первую букву метки).
 */
export interface GrSidebarContext {
  collapsed: Ref<boolean>
  /**
   * Сторона панели. Пункту она нужна ради подсказки в свёрнутом режиме: та
   * обязана уходить **от** панели, иначе накроет саму себя.
   */
  position: ComputedRef<GrSidebarPosition> | Ref<GrSidebarPosition>
}

export const GR_SIDEBAR_KEY: InjectionKey<GrSidebarContext> = Symbol.for('@feugene/granularity/sidebar')
