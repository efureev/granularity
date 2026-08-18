import type { ComponentExposed } from '../shared/instance'
import type GrChipComponent from './GrChip.vue'

export { default } from './GrChip.vue'
export { default as GrChip } from './GrChip.vue'
export { grChipConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrChipConfigurableProps } from './defaults'
export type { GrChipGroupContext, GrChipSelection, GrChipValue } from './grChipGroupContext'
export type { GrChipRadius, GrChipSize, GrChipTone } from './grChipStyles'
export { grChipSafelist } from './safelist'
export type { GrChipEmits, GrChipProps } from './GrChip.vue'
export type GrChipInstance = ComponentExposed<typeof GrChipComponent>
