export { default } from './GrDelta.vue'
export { default as GrDelta } from './GrDelta.vue'
export { grDeltaConfig } from './config'
export { deltaDirection, deltaTone } from './deltaTone'
export type { GrDeltaPolarity, GrDeltaProps, GrDeltaTone } from './GrDelta.vue'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrDeltaConfigurableProps } from './defaults'
export { grDeltaSafelist } from './safelist'
