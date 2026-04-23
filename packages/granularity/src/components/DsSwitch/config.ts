import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsSwitchSafelist } from './safelist'

export const dsSwitchConfig = defineGranularComponent(import.meta.url, {
  name: 'DsSwitch',
  safelist: dsSwitchSafelist,
})