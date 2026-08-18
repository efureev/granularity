import { defineRegistryGate } from '@feugene/granularity-test-kit/gates'

import { GRANULARITY_FORMS_SCHEMA_COMPONENTS } from '../componentNames'
import { granularityFormsSchemaComponentConfigs } from '../granular-provider/shared'

defineRegistryGate({
  componentConfigs: granularityFormsSchemaComponentConfigs,
  componentNames: GRANULARITY_FORMS_SCHEMA_COMPONENTS,
})
