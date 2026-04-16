<script setup lang="ts">
import { ref } from 'vue'

import { DsCheckbox, DsFormField, DsFormSection, DsInput } from '@feugene/granularity'

const channel = ref('release-updates')
const includeStakeholders = ref(true)
const requireApproval = ref(false)
</script>

<template>
  <DsFormSection
    title="Notification routing"
    description="Section wrappers keep longer forms readable when fields are grouped by intent."
  >
    <div class="grid gap-4">
      <DsFormField label="Slack channel" for-id="notify-channel">
        <DsInput id="notify-channel" v-model="channel" placeholder="release-updates" />
      </DsFormField>

      <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
        <DsCheckbox v-model="includeStakeholders">
          Include business stakeholders in the launch message
        </DsCheckbox>
        <DsCheckbox v-model="requireApproval">
          Require manual approval before notifications are sent
        </DsCheckbox>
      </div>
    </div>
  </DsFormSection>
</template>