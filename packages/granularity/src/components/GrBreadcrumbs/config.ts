import { defineGranumComponent } from '@feugene/granum/contract'

import { grBreadcrumbsSafelist } from './safelist'

export const grBreadcrumbsConfig = defineGranumComponent(import.meta.url, {
  name: 'GrBreadcrumbs',
  safelist: grBreadcrumbsSafelist,
  dependencies: ['GrLink'],
})
