import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsImageViewerSafelist } from './safelist'

export const dsImageViewerConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsImageViewer',
  safelist: dsImageViewerSafelist,
})