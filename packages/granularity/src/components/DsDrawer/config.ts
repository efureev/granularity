import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'
import { dsDrawerSafelist } from './safelist'

export const dsDrawerConfig = defineGranularComponent(import.meta.url, {
  name: 'DsDrawer',
  dependencies: ['DsButton', 'DsIcon'],
  safelist: dsDrawerSafelist,
})
