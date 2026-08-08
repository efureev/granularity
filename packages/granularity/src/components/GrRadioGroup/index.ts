import type { ComponentExposed } from '../shared/instance'
import type GrRadioGroupComponent from './GrRadioGroup.vue'

export { default } from './GrRadioGroup.vue'
export { default as GrRadioGroup } from './GrRadioGroup.vue'
export { grRadioGroupConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrRadioGroupConfigurableProps } from './defaults'
export type {
  GrRadioGroupOption,
  GrRadioGroupProps,
  GrRadioGroupVariant,
} from './GrRadioGroup.vue'
export type { GrRadioGroupEmits } from './GrRadioGroup.vue'
export type GrRadioGroupInstance = ComponentExposed<typeof GrRadioGroupComponent>
