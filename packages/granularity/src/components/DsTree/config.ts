import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsTreeSafelist } from './safelist'

export const dsTreeConfig = defineGranularComponent(import.meta.url, {
  name: 'DsTree',
  safelist: dsTreeSafelist,
})