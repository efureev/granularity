export { default } from './GrFormField.vue'
export { default as GrFormField } from './GrFormField.vue'
export { GR_FORM_FIELD_KEY, type GrFormFieldContext, useGrFormFieldContext } from './context'
export { grFormFieldConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrFormFieldConfigurableProps } from './defaults'
export type { GrFormFieldLabelPosition, GrFormFieldSize } from './grFormFieldStyles'
export { grFormFieldSafelist } from './safelist'
export type { GrFormFieldProps } from './GrFormField.vue'
