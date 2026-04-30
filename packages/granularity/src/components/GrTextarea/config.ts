import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grTextareaSafelist } from './safelist'

export const grTextareaConfig = defineGranularComponent(import.meta.url, {
  name: 'GrTextarea',
  safelist: grTextareaSafelist,
})