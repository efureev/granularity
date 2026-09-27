import { defineGranumComponent } from '@feugene/granum/contract'

/**
 * Granular-конфиг семейства `GrTabPanels` (контейнер `GrTabPanels` + панель
 * `GrTabPanel`). Companion к `GrTabs` для ARIA-связки `tab`↔`tabpanel`.
 */
export const grTabPanelsConfig = defineGranumComponent(import.meta.url, {
  name: 'GrTabPanels',
})
