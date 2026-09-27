import { defineGranumComponent } from '@feugene/granum/contract'

import { grDashboardSafelist } from './safelist'

/**
 * `group` — раскладка общих чанков: модули из `components/shared/` сборка кладёт
 * в `dist/groups/GrDashboardFrame/shared/`, а не в безымянный `dist/chunks/`, и
 * по имени группы видно, чьё это общее.
 *
 * На состав CSS это не влияет: классы извлекаются по графу бандла, и общий чанк
 * достаётся каждому компоненту, который до него дотягивается.
 */
export const grDashboardConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDashboard',
  group: 'GrDashboardFrame',
  safelist: grDashboardSafelist,
})
