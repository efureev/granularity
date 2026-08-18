import type { ComponentExposed } from '../shared/instance'
import type GrPopoverComponent from './GrPopover.vue'

export { default } from './GrPopover.vue'
export { default as GrPopover } from './GrPopover.vue'
export type { GrPopoverProps } from './GrPopover.vue'
export { grPopoverConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrPopoverConfigurableProps } from './defaults'
export type { GrPopoverPadding, GrPopoverRole, GrPopoverSize } from './grPopoverStyles'
export { grPopoverSafelist } from './safelist'
export type { GrPopoverEmits } from './GrPopover.vue'
export type GrPopoverInstance = ComponentExposed<typeof GrPopoverComponent>
