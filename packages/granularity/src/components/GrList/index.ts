import type { ComponentExposed } from '../shared/instance'
import type GrListComponent from './GrList.vue'

export { default } from './GrList.vue'
export { default as GrList } from './GrList.vue'
export type { GrListProps } from './GrList.vue'
export { default as GrListItem } from './GrListItem.vue'
export type { GrListItemDensity, GrListItemProps } from './GrListItem.vue'
export { grListConfig } from './config'
export { grListSafelist } from './safelist'
export type GrListInstance = ComponentExposed<typeof GrListComponent>
export type { GrListItemEmits } from './GrListItem.vue'
