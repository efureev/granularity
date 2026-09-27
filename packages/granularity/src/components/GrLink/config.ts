import { defineGranumComponent } from '@feugene/granum/contract'

import { grLinkSafelist } from './safelist'

export const grLinkConfig = defineGranumComponent(import.meta.url, {
  name: 'GrLink',
  dependencies: ['GrIcon'],
  safelist: grLinkSafelist,
})
