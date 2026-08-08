import type { ComponentExposed } from '../shared/instance'
import type GrNumberInputComponent from './GrNumberInput.vue'

export { default } from './GrNumberInput.vue'
export { default as GrNumberInput } from './GrNumberInput.vue'
export { grNumberInputConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrNumberInputConfigurableProps } from './defaults'
export { grNumberInputSafelist } from './safelist'
export type { GrNumberInputProps } from './GrNumberInput.vue'
export type {
  GrNumberInputControlsDirection,
  GrNumberInputSize,
  GrNumberInputState,
  GrNumberInputTextAlign,
  NumberInputControlsDirection,
  NumberInputSize,
} from './grNumberInputStyles'
export type { GrNumberInputEmits } from './GrNumberInput.vue'
export type GrNumberInputInstance = ComponentExposed<typeof GrNumberInputComponent>
