import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'
import { dsInputSafelist } from './safelist'

export const dsInputConfig = defineGranularComponent(import.meta.url, {
  name: 'DsInput',
  safelist: dsInputSafelist,
})
