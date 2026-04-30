import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grModalSafelist } from './safelist'

export const grModalConfig = defineGranularComponent(import.meta.url, {
  name: 'GrModal',
  safelist: grModalSafelist,
})