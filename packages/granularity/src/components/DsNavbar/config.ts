import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsNavbarSafelist } from './safelist'

export const dsNavbarConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsNavbar',
  dependencies: ['DsButton'],
  safelist: dsNavbarSafelist,
})