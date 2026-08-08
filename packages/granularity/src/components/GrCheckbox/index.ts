import type { ComponentExposed } from '../shared/instance'
import type GrCheckboxComponent from './GrCheckbox.vue'

export { default } from './GrCheckbox.vue'
export { default as GrCheckbox } from './GrCheckbox.vue'
export type { GrCheckboxProps } from './GrCheckbox.vue'
export { grCheckboxConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrCheckboxConfigurableProps } from './defaults'
export type { GrCheckboxLabelPosition, GrCheckboxSize } from './grCheckboxStyles'
export type { GrCheckboxGroupContext } from './grCheckboxGroupContext'
export { GR_CHECKBOX_GROUP_CONTEXT } from './grCheckboxGroupContext'
export { grCheckboxSafelist } from './safelist'
export type { GrCheckboxEmits } from './GrCheckbox.vue'
export type GrCheckboxInstance = ComponentExposed<typeof GrCheckboxComponent>
