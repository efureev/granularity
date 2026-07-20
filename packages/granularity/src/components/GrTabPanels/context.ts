import type { ComputedRef, InjectionKey } from 'vue'

/** Контекст, который `GrTabPanels` предоставляет своим `GrTabPanel`. */
export interface GrTabPanelsContext {
  /** Значение активной вкладки (совпадает с `modelValue` у `GrTabs`). */
  activeValue: ComputedRef<string>
  /** Общая база id для связки `tab`↔`tabpanel` (см. проп `idBase` у `GrTabs`). */
  idBase: string
}

export const GR_TAB_PANELS_KEY: InjectionKey<GrTabPanelsContext> = Symbol('gr-tab-panels')
