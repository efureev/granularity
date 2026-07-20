import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

/**
 * Granular-конфиг семейства `GrTabPanels` (контейнер `GrTabPanels` + панель
 * `GrTabPanel`). Companion к `GrTabs` для ARIA-связки `tab`↔`tabpanel`.
 */
export const grTabPanelsConfig = defineGranularComponent(import.meta.url, {
  name: 'GrTabPanels',
})
