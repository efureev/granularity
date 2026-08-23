import { defineRegistryGate } from '@feugene/granularity-test-kit/gates'

import { GRANULARITY_MEDIA_COMPONENTS } from '../componentNames'
import { granularityMediaComponentConfigs } from '../granular-provider/shared'

defineRegistryGate({
  componentConfigs: granularityMediaComponentConfigs,
  componentNames: GRANULARITY_MEDIA_COMPONENTS,
})
