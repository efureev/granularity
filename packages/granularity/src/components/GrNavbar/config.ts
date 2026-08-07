import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grNavbarSafelist } from './safelist'

export const grNavbarConfig = defineGranularComponent(import.meta.url, {
  name: 'GrNavbar',
  dependencies: ['GrButton', 'GrIcon'],
  safelist: grNavbarSafelist,
})
