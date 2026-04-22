import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const dsNavbarConfig = defineGranularComponent(import.meta.url, {
  name: 'DsNavbar',
  dependencies: ['DsButton', 'DsIcon'],
  safelist: [],
})
