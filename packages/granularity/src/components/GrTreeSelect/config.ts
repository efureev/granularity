import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grTreeSelectSafelist } from './safelist'

export const grTreeSelectConfig = defineGranularComponent(import.meta.url, {
  name: 'GrTreeSelect',
  safelist: grTreeSelectSafelist,
  dependencies: ['GrInput', 'GrTree'],
})