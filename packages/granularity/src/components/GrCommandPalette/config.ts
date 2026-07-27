import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grCommandPaletteSafelist } from './safelist'

export const grCommandPaletteConfig = defineGranularComponent(import.meta.url, {
  name: 'GrCommandPalette',
  safelist: grCommandPaletteSafelist,
  dependencies: ['GrKbd', 'GrModal'],
})
