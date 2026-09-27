import { defineGranumComponent } from '@feugene/granum/contract'

import { grBadgeSafelist } from './safelist'

export const grBadgeConfig = defineGranumComponent(import.meta.url, {
  name: 'GrBadge',
  safelist: grBadgeSafelist,
  tokenDefinitionsRef: {
    light: { url: './themes/light.css', selector: ':root' },
    dark: { url: './themes/dark.css', as: '.dark, [data-theme="dark"]' },
  },
})
