import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsButtonSafelist } from './safelist'

export const dsButtonConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsButton',
  safelist: dsButtonSafelist,
  cssFiles: ['./tokens.css'],
})