import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsPaginationSafelist } from './safelist'

export const dsPaginationConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsPagination',
  dependencies: ['DsButton', 'DsSelect'],
  safelist: dsPaginationSafelist,
})