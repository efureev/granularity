import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grSwitchSafelist } from './safelist'

export const grSwitchConfig = defineGranularComponent(import.meta.url, {
  name: 'GrSwitch',
  safelist: grSwitchSafelist,
})