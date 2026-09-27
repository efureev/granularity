import { defineGranumComponent } from '@feugene/granum/contract'

import { grSortableListSafelist } from './safelist'

export const grSortableListConfig = defineGranumComponent(import.meta.url, {
  name: 'GrSortableList',
  safelist: grSortableListSafelist,
  dependencies: ['GrCard'],
})
