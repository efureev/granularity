import { defineGranumComponent } from '@feugene/granum/contract'

import { grTreeSectionsSafelist } from './safelist'

export const grTreeSectionsConfig = defineGranumComponent(import.meta.url, {
  name: 'GrTreeSections',
  dependencies: ['GrTree'],
  safelist: grTreeSectionsSafelist,
})
