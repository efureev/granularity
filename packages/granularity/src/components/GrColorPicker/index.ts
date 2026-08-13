import type { ComponentExposed } from '../shared/instance'
import type GrColorPickerComponent from './GrColorPicker.vue'

export { default } from './GrColorPicker.vue'
export { default as GrColorPicker } from './GrColorPicker.vue'
export { grColorPickerConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrColorPickerConfigurableProps } from './defaults'
export type { GrColorPickerEmits, GrColorPickerProps } from './GrColorPicker.vue'
export type { GrColorPickerSize } from './grColorPickerStyles'
export { type GrHsla } from './color'
export { grColorPickerSafelist } from './safelist'
export type GrColorPickerInstance = ComponentExposed<typeof GrColorPickerComponent>
