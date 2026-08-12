export { default } from './GrTimePicker.vue'
export { default as GrTimePicker } from './GrTimePicker.vue'
export { grTimePickerConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrTimePickerConfigurableProps } from './defaults'
export type { GrTimePickerSize } from './grTimePickerStyles'
export { grTimePickerSafelist } from './safelist'
export type { GrTimePickerEmits, GrTimePickerProps } from './GrTimePicker.vue'
