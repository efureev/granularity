export { default } from './GrSwitch.vue'
export { default as GrSwitch } from './GrSwitch.vue'
export { grSwitchConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrSwitchConfigurableProps } from './defaults'
export { grSwitchSafelist } from './safelist'

export type { GrSwitchProps, GrSwitchSize } from './GrSwitch.vue'