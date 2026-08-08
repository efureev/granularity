import type { ComponentExposed } from '../shared/instance'
import type GrSegmentedComponent from './GrSegmented.vue'

export { default } from './GrSegmented.vue'
export { default as GrSegmented } from './GrSegmented.vue'
export { grSegmentedConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrSegmentedConfigurableProps } from './defaults'

export type {
  GrSegmentedOption,
  GrSegmentedSize,
  GrSegmentedValue,
  GrSegmentedVariant,
} from './grSegmentedStyles'
export type { GrSegmentedProps } from './GrSegmented.vue'
export { grSegmentedSafelist } from './safelist'
export type { GrSegmentedEmits } from './GrSegmented.vue'
export type GrSegmentedInstance = ComponentExposed<typeof GrSegmentedComponent>
