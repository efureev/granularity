import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grNavbarConfig = defineGranularComponent(import.meta.url, {
  name: 'GrNavbar',
  dependencies: ['GrButton', 'GrIcon'],
  safelist: [],
})
