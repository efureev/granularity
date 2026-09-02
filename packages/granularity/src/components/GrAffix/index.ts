import type { ComponentExposed } from '../shared/instance'
import type GrAffixComponent from './GrAffix.vue'

export { default } from './GrAffix.vue'
export { default as GrAffix } from './GrAffix.vue'
export type { GrAffixEmits, GrAffixProps } from './GrAffix.vue'
export { grAffixConfig } from './config'
export type { GrAffixPlacement } from './affixState'
export { grAffixSafelist } from './safelist'
export type GrAffixInstance = ComponentExposed<typeof GrAffixComponent>
