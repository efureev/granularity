export { default } from './GrChartHeatmap.vue'
export { default as GrChartHeatmap } from './GrChartHeatmap.vue'
export { grChartHeatmapConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrChartHeatmapConfigurableProps } from './defaults'
export type { GrChartHeatmapSize } from './grChartHeatmapStyles'
export { grChartHeatmapSafelist } from './safelist'
export type {
  GrChartHeatmapCell,
  GrChartHeatmapEmits,
  GrChartHeatmapProps,
} from './GrChartHeatmap.vue'
