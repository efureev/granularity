import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grAutocompleteSafelist } from './safelist'

export const grAutocompleteConfig = defineGranularComponent(import.meta.url, {
  name: 'GrAutocomplete',
  safelist: grAutocompleteSafelist,
})
