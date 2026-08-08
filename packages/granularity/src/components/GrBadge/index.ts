export { default } from './GrBadge.vue'
export { default as GrBadge } from './GrBadge.vue'
export { grBadgeConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrBadgeConfigurableProps } from './defaults'

export type { GrBadgeRadius, GrBadgeSize, GrBadgeTone } from './grBadgeStyles'
export { grBadgeSafelist } from './safelist'
export type { GrBadgeProps } from './GrBadge.vue'
