import { defineGranumComponent } from '@feugene/granum/contract'

import { grTimelineSafelist } from './safelist'

export const grTimelineConfig = defineGranumComponent(import.meta.url, {
  name: 'GrTimeline',
  safelist: grTimelineSafelist,
  dependencies: ['GrSkeleton'],
})
