export { default } from './GrChartFunnel.vue'
export { default as GrChartFunnel } from './GrChartFunnel.vue'
export { grChartFunnelConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrChartFunnelConfigurableProps } from './defaults'
export type { GrChartFunnelSize } from './grChartFunnelStyles'
export { grChartFunnelSafelist } from './safelist'
export type {
  GrChartFunnelActiveStage,
  GrChartFunnelEmits,
  GrChartFunnelProps,
} from './GrChartFunnel.vue'
