export { default } from './GrInputTag.vue'
export { default as GrInputTag } from './GrInputTag.vue'
export { grInputTagConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrInputTagConfigurableProps } from './defaults'

export type { GrInputTagProps } from './GrInputTag.vue'
export type { GrInputTagSize, GrInputTagState } from './grInputTagStyles'
export { grInputTagSafelist } from './safelist'