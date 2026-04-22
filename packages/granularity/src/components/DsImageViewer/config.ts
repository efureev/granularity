import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsImageViewerSafelist } from './safelist'

export const dsImageViewerConfig = defineGranularComponent(import.meta.url, {
  name: 'DsImageViewer',
  safelist: dsImageViewerSafelist,
})