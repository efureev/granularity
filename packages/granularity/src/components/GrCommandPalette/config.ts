import { defineGranumComponent } from '@feugene/granum/contract'

import { grCommandPaletteSafelist } from './safelist'

export const grCommandPaletteConfig = defineGranumComponent(import.meta.url, {
  name: 'GrCommandPalette',
  safelist: grCommandPaletteSafelist,
  dependencies: ['GrKbd', 'GrModal'],
})
