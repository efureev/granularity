export { default } from './GrBreadcrumbs.vue'
export { default as GrBreadcrumbs } from './GrBreadcrumbs.vue'
export { grBreadcrumbsConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrBreadcrumbsConfigurableProps } from './defaults'
export { resolveBreadcrumbsLayout } from './grBreadcrumbsStyles'
export type {
  GrBreadcrumbItem,
  GrBreadcrumbsLayoutEntry,
  GrBreadcrumbsSize,
} from './grBreadcrumbsStyles'
export type { GrBreadcrumbsProps } from './GrBreadcrumbs.vue'
export { grBreadcrumbsSafelist } from './safelist'
