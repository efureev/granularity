import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grBreadcrumbsSafelist } from './safelist'

export const grBreadcrumbsConfig = defineGranularComponent(import.meta.url, {
  name: 'GrBreadcrumbs',
  safelist: grBreadcrumbsSafelist,
  dependencies: ['GrLink'],
})
