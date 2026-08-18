import type { ComponentExposed } from '../shared/instance'
import type GrChipGroupComponent from './GrChipGroup.vue'

export { default } from './GrChipGroup.vue'
export { default as GrChipGroup } from './GrChipGroup.vue'
export { grChipGroupConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrChipGroupConfigurableProps } from './defaults'
export { grChipGroupSafelist } from './safelist'
export type { GrChipGroupEmits, GrChipGroupProps } from './GrChipGroup.vue'
export type GrChipGroupInstance = ComponentExposed<typeof GrChipGroupComponent>
