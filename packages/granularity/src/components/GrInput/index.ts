import type { ComponentExposed } from '../shared/instance'
import type GrInputComponent from './GrInput.vue'

export { default } from './GrInput.vue'
export { default as GrInput } from './GrInput.vue'
export { grInputConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrInputConfigurableProps } from './defaults'

export type { GrInputSize, GrInputTextAlign } from './GrInput.vue'
export { grInputSafelist } from './safelist'
export type { GrInputProps } from './GrInput.vue'
export type { GrInputEmits } from './GrInput.vue'
export type GrInputInstance = ComponentExposed<typeof GrInputComponent>
