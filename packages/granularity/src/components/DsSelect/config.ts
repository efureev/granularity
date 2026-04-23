import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsSelectSafelist } from './safelist'

export const dsSelectConfig = defineGranularComponent(import.meta.url, {
  name: 'DsSelect',
  dependencies: ['DsInput'],
  safelist: dsSelectSafelist,
})