import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsSwitchSafelist } from './safelist'

export const dsSwitchConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsSwitch',
  safelist: dsSwitchSafelist,
})