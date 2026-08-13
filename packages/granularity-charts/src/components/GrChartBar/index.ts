export { default } from './GrChartBar.vue'
export { default as GrChartBar } from './GrChartBar.vue'
export { grChartBarConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrChartBarConfigurableProps } from './defaults'
export type { GrChartBarSize } from './grChartBarStyles'
export { grChartBarSafelist } from './safelist'
export type { GrChartBarEmits, GrChartBarProps } from './GrChartBar.vue'
