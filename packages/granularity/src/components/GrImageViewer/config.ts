import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grImageViewerSafelist } from './safelist'

export const grImageViewerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrImageViewer',
  dependencies: ['GrIcon'],
  safelist: grImageViewerSafelist,
  tokenDefinitionsRef: {
    light: { url: './themes/light.css', selector: ':root' },
    dark: { url: './themes/dark.css', as: '.dark, [data-theme="dark"]' },
  },
})
