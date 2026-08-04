export { default } from './GrProgressBar.vue'
export { default as GrProgressBar, type GrProgressBarProps } from './GrProgressBar.vue'
export { grProgressBarConfig } from './config'
export { grProgressBarSafelist } from './safelist'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrProgressBarConfigurableProps } from './defaults'
export type { GrProgressBarSize, GrProgressBarTone } from './grStyle'