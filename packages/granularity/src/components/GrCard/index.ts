export { default } from './GrCard.vue'
export { default as GrCard } from './GrCard.vue'
export type { GrCardProps } from './GrCard.vue'
export { grCardConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrCardConfigurableProps } from './defaults'
export type { GrCardHeadingLevel, GrCardPadding, GrCardVariant } from './grCardStyles'
export { grCardSafelist } from './safelist'
export type { GrCardEmits } from './GrCard.vue'
