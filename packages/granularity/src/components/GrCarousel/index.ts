import type { ComponentExposed } from '../shared/instance'

import type GrCarouselComponent from './GrCarousel.vue'

export { default } from './GrCarousel.vue'
export { default as GrCarousel } from './GrCarousel.vue'
export { default as GrCarouselSlide } from './GrCarouselSlide.vue'
export { grCarouselConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrCarouselConfigurableProps } from './defaults'
export type { GrCarouselEmits, GrCarouselProps } from './GrCarousel.vue'
export type { GrCarouselSlideProps } from './GrCarouselSlide.vue'
export type { GrCarouselActivationMode, GrCarouselIndicators } from './grCarouselStyles'
export { grCarouselSafelist } from './safelist'
export type GrCarouselInstance = ComponentExposed<typeof GrCarouselComponent>
