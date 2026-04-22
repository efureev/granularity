import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'
import { dsButtonSafelist } from './safelist'

export const dsButtonConfig = defineGranularComponent(import.meta.url, {
  name: 'DsButton',
  safelist: dsButtonSafelist,
})
