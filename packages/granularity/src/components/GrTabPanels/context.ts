import type { ComputedRef, InjectionKey } from 'vue'

/** Контекст, который `GrTabPanels` предоставляет своим `GrTabPanel`. */
export interface GrTabPanelsContext {
  /** Значение активной вкладки (совпадает с `modelValue` у `GrTabs`). */
  activeValue: ComputedRef<string>
  /** Общая база id для связки `tab`↔`tabpanel` (см. проп `idBase` у `GrTabs`). */
  idBase: ComputedRef<string>
  /**
   * Задал ли `idBase` потребитель. Без него вкладок с подходящими id не
   * существует: `GrTabs` проставляет их **только** при явном `idBase`, — и
   * ссылаться на них панели нечем.
   */
  tabsLinked: ComputedRef<boolean>
}

export const GR_TAB_PANELS_KEY: InjectionKey<GrTabPanelsContext> = Symbol('gr-tab-panels')
