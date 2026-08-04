export { default } from './GrDataTable.vue'
export { default as GrDataTable } from './GrDataTable.vue'
export type { GrDataColumn, GrDataTableProps, GrDataTableRowKey } from './GrDataTable.vue'
export { grDataTableConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrDataTableConfigurableProps } from './defaults'
export type { GrDataTableSize } from './grDataTableStyles'
export { grDataTableSafelist } from './safelist'
