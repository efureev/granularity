import { defineGranumComponent } from '@feugene/granum/contract'

import { grDataTableSafelist } from './safelist'

export const grDataTableConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDataTable',
  dependencies: ['GrTable', 'GrIcon', 'GrCheckbox', 'GrButton', 'GrSkeleton', 'GrDropdownMenu'],
  safelist: grDataTableSafelist,
  // Только светлая: обе роли ссылаются на токены, которые сами меняются с темой.
  tokenDefinitionsRef: {
    light: { url: './themes/light.css', selector: ':root' },
  },
})
