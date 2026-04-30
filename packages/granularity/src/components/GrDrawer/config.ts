import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'
import { grDrawerSafelist } from './safelist'

export const grDrawerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDrawer',
  dependencies: ['GrButton', 'GrIcon'],
  safelist: grDrawerSafelist,
})
