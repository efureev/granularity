import type { ComponentExposed } from '../shared/instance'
import type GrToasterComponent from './GrToaster.vue'

export { default } from './GrToaster.vue'
export { default as GrToaster } from './GrToaster.vue'
export type { GrToasterPlacement, GrToasterProps } from './GrToaster.vue'
export { grToasterConfig } from './config'
export { grToasterSafelist } from './safelist'
export type { GrToastTone, Toast, ToastAction, ToastInput } from '../../composables/useToast'
export type GrToasterInstance = ComponentExposed<typeof GrToasterComponent>
