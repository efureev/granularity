import type { ComponentExposed } from '../shared/instance'
import type GrAutocompleteComponent from './GrAutocomplete.vue'

export { default } from './GrAutocomplete.vue'
export { default as GrAutocomplete } from './GrAutocomplete.vue'
export { grAutocompleteConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrAutocompleteConfigurableProps } from './defaults'
export type {
  GrAutocompleteModelValue,
  GrAutocompleteOption,
  GrAutocompleteProps,
  GrAutocompleteSize,
} from './GrAutocomplete.vue'
export { grAutocompleteSafelist } from './safelist'
export type { GrAutocompleteEmits } from './GrAutocomplete.vue'
export type GrAutocompleteInstance = ComponentExposed<typeof GrAutocompleteComponent>
