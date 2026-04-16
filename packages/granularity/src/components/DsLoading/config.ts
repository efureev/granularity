import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsLoadingSafelist } from './safelist'

export const dsLoadingConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsLoading',
  safelist: dsLoadingSafelist,
})