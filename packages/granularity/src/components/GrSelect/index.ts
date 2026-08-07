export { default } from './GrSelect.vue'
export { default as GrSelect } from './GrSelect.vue'
export { grSelectConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrSelectConfigurableProps } from './defaults'
export type {
  GrSelectModelValue,
  GrSelectOption,
  GrSelectOptionGroup,
  GrSelectOptionOrGroup,
  GrSelectOptionsView,
  GrSelectProps,
  GrSelectSize,
  GrSelectState,
  GrSelectUnderline,
  GrSelectVariant,
  GrSelectView,
} from './GrSelect.vue'
export { grSelectSafelist } from './safelist'
