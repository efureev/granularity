import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grSelectSafelist } from './safelist'

export const grSelectConfig = defineGranularComponent(import.meta.url, {
  name: 'GrSelect',
  dependencies: ['GrInput'],
  safelist: grSelectSafelist,
})