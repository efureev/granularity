import { defineGranumComponent } from '@feugene/granum/contract'

import { grProgressBarSafelist } from './safelist'

export const grProgressBarConfig = defineGranumComponent(import.meta.url, {
  name: 'GrProgressBar',
  safelist: grProgressBarSafelist,
  tokenDefinitionsRef: {
    light: { url: './themes/light.css', selector: ':root' },
    dark: { url: './themes/dark.css', as: '.dark, [data-theme="dark"]' },
  },
})
