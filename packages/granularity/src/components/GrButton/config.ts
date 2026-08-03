import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'
import { grButtonSafelist } from './safelist'

export const grButtonConfig = defineGranularComponent(import.meta.url, {
  name: 'GrButton',
  safelist: grButtonSafelist,
  tokenDefinitionsRef: {
    light: { url: './themes/light.css', selector: ':root' },
    dark: { url: './themes/dark.css', as: '.dark, [data-theme="dark"]' },
  },
})
