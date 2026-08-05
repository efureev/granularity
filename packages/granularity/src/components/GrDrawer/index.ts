export { default } from './GrDrawer.vue'
export { default as GrDrawer } from './GrDrawer.vue'
export { grDrawerConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrDrawerConfigurableProps } from './defaults'
export { grDrawerSafelist } from './safelist'
export type { GrDrawerProps } from './GrDrawer.vue'
export type { GrDrawerSectionConfig, GrDrawerSide, GrDrawerSize } from './grDrawerStyles'
