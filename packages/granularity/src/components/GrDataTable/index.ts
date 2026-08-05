export { default } from './GrDataTable.vue'
export { default as GrDataTable } from './GrDataTable.vue'
export type {
  GrDataColumn,
  GrDataColumnKey,
  GrDataTableProps,
  GrDataTableRowKey,
  GrDataTableSortCycle,
} from './GrDataTable.vue'
export type { GrDataTableSortDir } from './grDataTableSort'
export { compareCells, isEmptyCell, sortRows } from './grDataTableSort'
export { grDataTableConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrDataTableConfigurableProps } from './defaults'
export type { GrDataTableSize } from './grDataTableStyles'
export { grDataTableSafelist } from './safelist'
