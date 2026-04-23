import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsLoadingSafelist } from './safelist'

export const dsLoadingConfig = defineGranularComponent(import.meta.url, {
  name: 'DsLoading',
  safelist: dsLoadingSafelist,
})