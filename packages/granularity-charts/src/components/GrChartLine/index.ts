export { default } from './GrChartLine.vue'
export { default as GrChartLine } from './GrChartLine.vue'
export { grChartLineConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrChartLineConfigurableProps } from './defaults'
export type { GrChartLineSize } from './grChartLineStyles'
export { grChartLineSafelist } from './safelist'
export type { GrChartLineEmits, GrChartLineProps } from './GrChartLine.vue'
