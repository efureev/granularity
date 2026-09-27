export { default } from './GrFormField.vue'
export { default as GrFormField } from './GrFormField.vue'
export { type GrFormFieldContext, useGrFormFieldContext } from '../shared/formFieldContext'
export { grFormFieldConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrFormFieldConfigurableProps } from './defaults'
export type { GrFormFieldLabelPosition, GrFormFieldSize } from './grFormFieldStyles'
export { grFormFieldSafelist } from './safelist'
export type { GrFormFieldProps } from './GrFormField.vue'
