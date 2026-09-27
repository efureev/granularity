import { defineGranumComponent } from '@feugene/granum/contract'

import { grNavbarSafelist } from './safelist'

export const grNavbarConfig = defineGranumComponent(import.meta.url, {
  name: 'GrNavbar',
  dependencies: ['GrButton', 'GrIcon'],
  safelist: grNavbarSafelist,
})
