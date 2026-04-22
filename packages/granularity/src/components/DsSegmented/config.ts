import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsSegmentedSafelist } from './safelist'

export const dsSegmentedConfig = defineGranularComponent(import.meta.url, {
  name: 'DsSegmented',
  safelist: dsSegmentedSafelist,
  cssFiles: ['./tokens.css'],
})