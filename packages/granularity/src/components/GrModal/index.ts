import type { ComponentExposed } from '../shared/instance'
import type GrModalComponent from './GrModal.vue'

export { default } from './GrModal.vue'
export { default as GrModal } from './GrModal.vue'
export type { GrModalProps } from './GrModal.vue'
export { grModalConfig } from './config'
export type { GrModalScrollBehavior, GrModalSize } from './grModalStyles'
export { grModalSafelist } from './safelist'
export type { GrModalEmits } from './GrModal.vue'
export type GrModalInstance = ComponentExposed<typeof GrModalComponent>
