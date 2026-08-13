export { default } from './GrTabs.vue'
export { default as GrTabs } from './GrTabs.vue'
export type { GrTab, GrTabsProps } from './GrTabs.vue'
export { grTabsConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrTabsConfigurableProps } from './defaults'
export type { GrTabsOrientation, GrTabsSize, GrTabsVariant } from './grTabsStyles'
export { grTabsSafelist } from './safelist'
export type { GrTabsEmits } from './GrTabs.vue'
