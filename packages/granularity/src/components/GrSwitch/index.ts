import type { ComponentExposed } from '../shared/instance'
import type GrSwitchComponent from './GrSwitch.vue'

export { default } from './GrSwitch.vue'
export { default as GrSwitch } from './GrSwitch.vue'
export { grSwitchConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrSwitchConfigurableProps } from './defaults'
export { grSwitchSafelist } from './safelist'

export type { GrSwitchLabelPosition, GrSwitchProps, GrSwitchSize } from './GrSwitch.vue'
export type { GrSwitchEmits } from './GrSwitch.vue'
export type GrSwitchInstance = ComponentExposed<typeof GrSwitchComponent>
