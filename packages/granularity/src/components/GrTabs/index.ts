export { default } from './GrTabs.vue'
export { default as GrTabs } from './GrTabs.vue'
export type { GrTab, GrTabsProps } from './GrTabs.vue'
export { grTabsConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrTabsConfigurableProps } from './defaults'
export { GR_TABS_VARIANTS } from './grTabsStyles'
export type { GrTabsOrientation, GrTabsSize, GrTabsVariant } from './grTabsStyles'
export { grTabsSafelist } from './safelist'
