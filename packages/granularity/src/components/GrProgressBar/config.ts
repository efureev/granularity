import { defineGranumComponent } from '@feugene/granum/contract'

import { grProgressBarSafelist } from './safelist'

export const grProgressBarConfig = defineGranumComponent(import.meta.url, {
  name: 'GrProgressBar',
  safelist: grProgressBarSafelist,
  themesDir: './themes',
})
