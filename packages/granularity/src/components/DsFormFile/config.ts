import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsFormFileSafelist } from './safelist'

export const dsFormFileConfig = defineGranularComponent(import.meta.url, {
  name: 'DsFormFile',
  dependencies: ['DsButton'],
  safelist: dsFormFileSafelist,
})