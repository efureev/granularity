import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsModalSafelist } from './safelist'

export const dsModalConfig = defineGranularComponent(import.meta.url, {
  name: 'DsModal',
  safelist: dsModalSafelist,
})