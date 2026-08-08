import type { ComponentExposed } from '../shared/instance'
import type GrRatingComponent from './GrRating.vue'

export { default } from './GrRating.vue'
export { default as GrRating } from './GrRating.vue'
export { grRatingConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrRatingConfigurableProps } from './defaults'
export type {
  GrRatingProps,
  GrRatingSize,
  GrRatingTone,
} from './GrRating.vue'
export { grRatingSafelist } from './safelist'
export type { GrRatingEmits } from './GrRating.vue'
export type GrRatingInstance = ComponentExposed<typeof GrRatingComponent>
