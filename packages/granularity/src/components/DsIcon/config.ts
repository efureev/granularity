import { defineGranularityComponentConfig } from '../../registry/componentConfig'

export const dsIconConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsIcon',
  safelist: [],
  cssFiles: ['./tokens.css', './styles.css'],
})