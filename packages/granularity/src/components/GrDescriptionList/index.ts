export { default } from './GrDescriptionList.vue'
export { default as GrDescriptionList } from './GrDescriptionList.vue'
export { grDescriptionListConfig } from './config'
export type {
  GrDescriptionColumns,
  GrDescriptionDensity,
  GrDescriptionItem,
  GrDescriptionLayout,
  GrDescriptionListProps,
} from './GrDescriptionList.vue'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrDescriptionListConfigurableProps } from './defaults'
export { grDescriptionListSafelist } from './safelist'
