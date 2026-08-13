export { default } from './GrChartArea.vue'
export { default as GrChartArea } from './GrChartArea.vue'
export { grChartAreaConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrChartAreaConfigurableProps } from './defaults'
export type { GrChartAreaSize } from './grChartAreaStyles'
export { grChartAreaSafelist } from './safelist'
export type { GrChartAreaEmits, GrChartAreaProps } from './GrChartArea.vue'
