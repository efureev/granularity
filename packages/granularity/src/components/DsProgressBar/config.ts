import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsProgressBarSafelist } from './safelist'

export const dsProgressBarConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsProgressBar',
  safelist: dsProgressBarSafelist,
  cssFiles: ['./tokens.css'],
})