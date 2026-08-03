export { default } from './GrLink.vue'
export { default as GrLink } from './GrLink.vue'
export { grLinkConfig } from './config'

export type { GrLinkSize, GrLinkTone, GrLinkUnderline, GrLinkVariant } from './grLinkStyles'
export { grLinkSafelist } from './safelist'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrLinkConfigurableProps } from './defaults'
