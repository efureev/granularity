import { defineGranumComponent } from '@feugene/granum/contract'

import { grDescriptionListSafelist } from './safelist'

export const grDescriptionListConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDescriptionList',
  safelist: grDescriptionListSafelist,
})
