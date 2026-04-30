import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grLoadingSafelist } from './safelist'

export const grLoadingConfig = defineGranularComponent(import.meta.url, {
  name: 'GrLoading',
  safelist: grLoadingSafelist,
})