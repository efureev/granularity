import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDataTableSafelist } from './safelist'

export const grDataTableConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDataTable',
  dependencies: ['GrTable', 'GrIcon', 'GrCheckbox', 'GrButton', 'GrSkeleton'],
  safelist: grDataTableSafelist,
  // Только светлая: обе роли ссылаются на токены, которые сами меняются с темой.
  tokenDefinitionsRef: {
    light: { url: './themes/light.css', selector: ':root' },
  },
})
