import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'
import { grButtonSafelist } from './safelist'

export const grButtonConfig = defineGranularComponent(import.meta.url, {
  name: 'GrButton',
  safelist: grButtonSafelist,
})
