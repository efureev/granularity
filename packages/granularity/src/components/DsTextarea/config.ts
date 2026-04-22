import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsTextareaSafelist } from './safelist'

export const dsTextareaConfig = defineGranularComponent(import.meta.url, {
  name: 'DsTextarea',
  safelist: dsTextareaSafelist,
})