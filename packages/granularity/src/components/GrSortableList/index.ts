import type { ComponentExposed } from '../shared/instance'
import type GrSortableListComponent from './GrSortableList.vue'

export { default } from './GrSortableList.vue'
export { default as GrSortableList } from './GrSortableList.vue'
export type { GrSortableListEmits, GrSortableListProps } from './GrSortableList.vue'
export type { GrSortableOrientation } from './grSortableListStyles'
export { grSortableListConfig } from './config'
export { grSortableListSafelist } from './safelist'
export type GrSortableListInstance = ComponentExposed<typeof GrSortableListComponent>
