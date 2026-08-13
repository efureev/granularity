/**
 * Имена публичных компонентов пакета одним списком.
 *
 * Модуль намеренно без импортов: его читают и резолвер авто-импорта, и
 * `vite.config.ts` — то есть он исполняется в Node на этапе сборки, куда `.vue`
 * и рантайм Vue затягивать нечем и незачем.
 *
 * Блок под маркерами генерируется `yarn generate:registry` — руками внутри него
 * не писать, следующая генерация затрёт.
 */
export const GRANULARITY_DASHBOARD_COMPONENTS = [
  // <granularity:components> — блок генерируется `yarn generate:registry`
  'GrDashboard',
  'GrDashboardItem',
  'GrDashboardPalette',
  'GrDashboardToolbar',
  // </granularity:components>
] as const

export type GranularityDashboardComponentName = typeof GRANULARITY_DASHBOARD_COMPONENTS[number]
