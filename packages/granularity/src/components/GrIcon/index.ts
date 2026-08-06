export { default } from './GrIcon.vue'
export { default as GrIcon } from './GrIcon.vue'
export { grIconConfig } from './config'
export { grIconSafelist } from './safelist'
export type { GrIconSize, GrIconTone } from './grIconStyles'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrIconConfigurableProps } from './defaults'
