import type { ComponentExposed } from '../shared/instance'
import type GrToasterComponent from './GrToaster.vue'

export { default } from './GrToaster.vue'
export { default as GrToaster } from './GrToaster.vue'
export type { GrToasterPlacement, GrToasterProps } from './GrToaster.vue'
export { grToasterConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrToasterConfigurableProps } from './defaults'
export { grToasterSafelist } from './safelist'
export type { GrToastTone, Toast, ToastAction, ToastInput } from '../../composables/useToast'
export type GrToasterInstance = ComponentExposed<typeof GrToasterComponent>
