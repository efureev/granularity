import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grTreeSafelist } from './safelist'

export const grTreeConfig = defineGranularComponent(import.meta.url, {
  name: 'GrTree',
  safelist: grTreeSafelist,
})