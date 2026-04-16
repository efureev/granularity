import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsSkeletonSafelist } from './safelist'

export const dsSkeletonConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsSkeleton',
  safelist: dsSkeletonSafelist,
})