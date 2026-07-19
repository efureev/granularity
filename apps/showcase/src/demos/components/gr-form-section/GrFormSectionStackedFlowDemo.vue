<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrFormField, GrFormSection, GrInput } from '@feugene/granularity'

const owner = ref('release-manager@company.dev')
const runbook = ref('docs/runbooks/incident-handoff')
</script>

<template>
  <div class="grid gap-6">
    <GrFormSection title="Ownership">
      <GrFormField label="Primary owner" for-id="incident-owner">
        <GrInput id="incident-owner" v-model="owner" placeholder="name@company.dev" />
      </GrFormField>
    </GrFormSection>

    <GrFormSection title="Operational assets" description="Multiple sections can be stacked to create a light-weight form page skeleton.">
      <div class="grid gap-4">
        <GrFormField label="Runbook path" for-id="runbook-path">
          <GrInput id="runbook-path" v-model="runbook" placeholder="docs/runbooks/..." />
        </GrFormField>

        <div class="flex flex-wrap gap-2">
          <GrBadge tone="success" radius="round">Owner assigned</GrBadge>
          <GrBadge tone="info" radius="round">Runbook linked</GrBadge>
        </div>
      </div>
    </GrFormSection>
  </div>
</template>