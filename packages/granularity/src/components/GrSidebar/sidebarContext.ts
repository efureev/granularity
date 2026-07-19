import type { InjectionKey, Ref } from 'vue'

/**
 * Контекст `GrSidebar`, который потребляют `GrSidebarItem`'ы: свёрнута ли панель.
 * В свёрнутом состоянии пункты показывают только иконку (или первую букву метки).
 */
export interface GrSidebarContext {
  collapsed: Ref<boolean>
}

export const GR_SIDEBAR_KEY: InjectionKey<GrSidebarContext> = Symbol.for('@feugene/granularity/sidebar')
