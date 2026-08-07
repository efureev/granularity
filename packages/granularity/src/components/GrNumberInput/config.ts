import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grNumberInputSafelist } from './safelist'

export const grNumberInputConfig = defineGranularComponent(import.meta.url, {
  name: 'GrNumberInput',
  dependencies: ['GrIcon'],
  safelist: grNumberInputSafelist,
})