import { defineRegistryGate } from '@feugene/granularity-test-kit/gates'

import { GRANULARITY_EDITOR_COMPONENTS } from '../componentNames'
import { granularityEditorComponentConfigs } from '../granular-provider/shared'

defineRegistryGate({
  componentConfigs: granularityEditorComponentConfigs,
  componentNames: GRANULARITY_EDITOR_COMPONENTS,
})
