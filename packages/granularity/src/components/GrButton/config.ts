import { defineGranumComponent } from '@feugene/granum/contract'
import { grButtonSafelist } from './safelist'

export const grButtonConfig = defineGranumComponent(import.meta.url, {
  name: 'GrButton',
  safelist: grButtonSafelist,
  tokenDefinitionsRef: {
    light: { url: './themes/light.css', selector: ':root' },
    dark: { url: './themes/dark.css', as: '.dark, [data-theme="dark"]' },
  },
})
