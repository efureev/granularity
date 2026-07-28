export { default } from './GrRadio.vue'
export { default as GrRadio, type GrRadioProps } from './GrRadio.vue'
export { grRadioConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrRadioConfigurableProps } from './defaults'
export type { GrRadioVariant } from './grRadioStyles'
export type { GrRadioGroupContext } from './grRadioGroupContext'
export { GR_RADIO_GROUP_CONTEXT } from './grRadioGroupContext'
export { grRadioSafelist } from './safelist'
