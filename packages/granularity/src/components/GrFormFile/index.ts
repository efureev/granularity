import type { ComponentExposed } from '../shared/instance'
import type GrFormFileComponent from './GrFormFile.vue'

export { default } from './GrFormFile.vue'
export { default as GrFormFile } from './GrFormFile.vue'
export { grFormFileConfig } from './config'
export type { GrFormFileError, GrFormFileProps } from './GrFormFile.vue'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrFormFileConfigurableProps } from './defaults'
export type { GrFormFileSize } from './grFormFileStyles'
export { grFormFileSafelist } from './safelist'
export type { GrFormFileEmits } from './GrFormFile.vue'
export type GrFormFileInstance = ComponentExposed<typeof GrFormFileComponent>
