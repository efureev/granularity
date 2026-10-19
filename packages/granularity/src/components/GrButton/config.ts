import { defineGranumComponent } from '@feugene/granum/contract'
import { grButtonSafelist } from './safelist'

export const grButtonConfig = defineGranumComponent(import.meta.url, {
  name: 'GrButton',
  safelist: grButtonSafelist,
  themesDir: './themes',
})
