<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsFormField, DsFormSection, DsInput } from '@feugene/granularity'

const owner = ref('release-manager@company.dev')
const runbook = ref('docs/runbooks/incident-handoff')
</script>

<template>
  <div class="grid gap-6">
    <DsFormSection title="Ownership">
      <DsFormField label="Primary owner" for-id="incident-owner">
        <DsInput id="incident-owner" v-model="owner" placeholder="name@company.dev" />
      </DsFormField>
    </DsFormSection>

    <DsFormSection title="Operational assets" description="Multiple sections can be stacked to create a light-weight form page skeleton.">
      <div class="grid gap-4">
        <DsFormField label="Runbook path" for-id="runbook-path">
          <DsInput id="runbook-path" v-model="runbook" placeholder="docs/runbooks/..." />
        </DsFormField>

        <div class="flex flex-wrap gap-2">
          <DsBadge tone="success" radius="round">Owner assigned</DsBadge>
          <DsBadge tone="info" radius="round">Runbook linked</DsBadge>
        </div>
      </div>
    </DsFormSection>
  </div>
</template>