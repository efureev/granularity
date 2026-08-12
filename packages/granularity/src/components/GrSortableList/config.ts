import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grSortableListSafelist } from './safelist'

export const grSortableListConfig = defineGranularComponent(import.meta.url, {
  name: 'GrSortableList',
  safelist: grSortableListSafelist,
  dependencies: ['GrCard'],
})
