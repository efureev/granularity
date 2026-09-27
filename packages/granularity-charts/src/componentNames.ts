/**
 * Имена компонентов пакета — одним списком без единого импорта.
 *
 * Читает его `resolver.ts` — whitelist авто-импорта. Отдельным файлом именно
 * поэтому: резолвер тянет `unplugin-vue-components`, и списку незачем платить
 * этой зависимостью за каждое своё чтение.
 *
 * Список генерируется `yarn generate:registry` — руками не писать.
 */
export const GRANULARITY_CHARTS_COMPONENTS = [
  // <granularity:components> — блок генерируется `yarn generate:registry`
  'GrChartArea',
  'GrChartBar',
  'GrChartBullet',
  'GrChartFunnel',
  'GrChartHeatmap',
  'GrChartLine',
  'GrChartPie',
  'GrChartRadar',
  'GrChartWaterfall',
  'GrSparkline',
  // </granularity:components>
] as const

export type GranularityChartsComponentName = typeof GRANULARITY_CHARTS_COMPONENTS[number]
