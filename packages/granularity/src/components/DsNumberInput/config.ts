import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsNumberInputSafelist } from './safelist'

export const dsNumberInputConfig = defineGranularComponent(import.meta.url, {
  name: 'DsNumberInput',
  safelist: dsNumberInputSafelist,
})