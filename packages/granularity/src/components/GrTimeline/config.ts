import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grTimelineSafelist } from './safelist'

export const grTimelineConfig = defineGranularComponent(import.meta.url, {
  name: 'GrTimeline',
  safelist: grTimelineSafelist,
  dependencies: ['GrSkeleton'],
})
