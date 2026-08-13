export { default } from './GrChartPie.vue'
export { default as GrChartPie } from './GrChartPie.vue'
export { grChartPieConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrChartPieConfigurableProps } from './defaults'
export type { GrChartPieSize, GrChartPieTexture } from './grChartPieStyles'
export { GR_CHART_PIE_TEXTURES, pieTextureFor, pieTexturePaths } from './grChartPieStyles'
export { grChartPieSafelist } from './safelist'
export type {
  GrChartPieActiveSlice,
  GrChartPieEmits,
  GrChartPieProps,
  GrChartPieSlice,
} from './GrChartPie.vue'
