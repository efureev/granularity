export { default } from './GrPagination.vue'
export { default as GrPagination, type GrPaginationProps } from './GrPagination.vue'
export { grPaginationConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrPaginationConfigurableProps } from './defaults'
export type { GrPaginationSize } from './grPaginationStyles'
export { grPaginationSafelist } from './safelist'
export type { GrPaginationEmits } from './GrPagination.vue'
