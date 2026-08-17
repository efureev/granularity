export { default } from './GrChartWaterfall.vue'
export { default as GrChartWaterfall } from './GrChartWaterfall.vue'
export { grChartWaterfallConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrChartWaterfallConfigurableProps } from './defaults'
export type { GrChartWaterfallSize } from './grChartWaterfallStyles'
export { grChartWaterfallSafelist } from './safelist'
export type {
  GrChartWaterfallActiveStep,
  GrChartWaterfallEmits,
  GrChartWaterfallProps,
} from './GrChartWaterfall.vue'
