import type { ComponentExposed } from '../shared/instance'
import type GrTableComponent from './GrTable.vue'

export { default } from './GrTable.vue'
export { default as GrTable } from './GrTable.vue'
export type { GrTableProps } from './GrTable.vue'
export { grTableConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrTableConfigurableProps } from './defaults'
export type { GrTableSize } from './grTableStyles'
export { grTableSafelist } from './safelist'
export type GrTableInstance = ComponentExposed<typeof GrTableComponent>
