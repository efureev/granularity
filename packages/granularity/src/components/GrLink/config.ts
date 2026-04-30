import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grLinkSafelist } from './safelist'

export const grLinkConfig = defineGranularComponent(import.meta.url, {
  name: 'GrLink',
  safelist: grLinkSafelist,
})