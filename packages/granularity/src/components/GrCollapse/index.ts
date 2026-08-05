export { default } from './GrCollapse.vue'
export { default as GrCollapse, type GrCollapseProps } from './GrCollapse.vue'
export { default as GrCollapseItem, type GrCollapseItemProps } from './GrCollapseItem.vue'
export { grCollapseConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrCollapseConfigurableProps } from './defaults'
export { grCollapseSafelist } from './safelist'

export type * from './grCollapseContext'
export * from './grCollapseContext'
