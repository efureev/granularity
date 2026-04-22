import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsInputTagSafelist } from './safelist'

export const dsInputTagConfig = defineGranularComponent(import.meta.url, {
  name: 'DsInputTag',
  dependencies: ['DsBadge', 'DsInput'],
  safelist: dsInputTagSafelist,
})