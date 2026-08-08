import type { ComponentExposed } from '../shared/instance'
import type GrCheckboxGroupComponent from './GrCheckboxGroup.vue'

export { default } from './GrCheckboxGroup.vue'
export { default as GrCheckboxGroup } from './GrCheckboxGroup.vue'
export { grCheckboxGroupConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrCheckboxGroupConfigurableProps } from './defaults'
export type {
  GrCheckboxGroupDirection,
  GrCheckboxGroupOption,
  GrCheckboxGroupProps,
} from './GrCheckboxGroup.vue'
export type { GrCheckboxGroupEmits } from './GrCheckboxGroup.vue'
export type GrCheckboxGroupInstance = ComponentExposed<typeof GrCheckboxGroupComponent>
