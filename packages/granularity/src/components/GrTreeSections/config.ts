import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grTreeSectionsSafelist } from './safelist'

export const grTreeSectionsConfig = defineGranularComponent(import.meta.url, {
  name: 'GrTreeSections',
  dependencies: ['GrTree'],
  safelist: grTreeSectionsSafelist,
})
