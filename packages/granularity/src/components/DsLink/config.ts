import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsLinkSafelist } from './safelist'

export const dsLinkConfig = defineGranularComponent(import.meta.url, {
  name: 'DsLink',
  safelist: dsLinkSafelist,
})