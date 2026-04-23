import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsTreeSelectSafelist } from './safelist'

export const dsTreeSelectConfig = defineGranularComponent(import.meta.url, {
  name: 'DsTreeSelect',
  safelist: dsTreeSelectSafelist,
  dependencies: ['DsInput', 'DsTree'],
})