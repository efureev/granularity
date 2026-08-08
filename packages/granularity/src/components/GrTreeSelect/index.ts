import type { ComponentExposed } from '../shared/instance'
import type GrTreeSelectComponent from './GrTreeSelect.vue'

export { default } from './GrTreeSelect.vue'
export { default as GrTreeSelect } from './GrTreeSelect.vue'
export type { GrTreeSelectModelValue, GrTreeSelectProps, GrTreeSelectValueDisplay } from './grTreeSelectTypes'
export { grTreeSelectConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrTreeSelectConfigurableProps } from './defaults'
export { grTreeSelectSafelist } from './safelist'
export type { GrTreeSelectEmits } from './GrTreeSelect.vue'
export type GrTreeSelectInstance = ComponentExposed<typeof GrTreeSelectComponent>
