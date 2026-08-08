import type { ComponentExposed } from '../shared/instance'
import type GrDropdownComponent from './GrDropdown.vue'

export { default } from './GrDropdown.vue'
export { default as GrDropdown } from './GrDropdown.vue'
export { grDropdownConfig } from './config'
export { grDropdownSafelist } from './safelist'
export type { GrDropdownProps, GrDropdownTrigger } from './GrDropdown.vue'
export type { GrDropdownWidth } from './grDropdownStyles'
export type GrDropdownInstance = ComponentExposed<typeof GrDropdownComponent>
