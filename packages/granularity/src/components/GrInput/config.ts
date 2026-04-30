import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'
import { grInputSafelist } from './safelist'

export const grInputConfig = defineGranularComponent(import.meta.url, {
  name: 'GrInput',
  safelist: grInputSafelist,
})
