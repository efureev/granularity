<script setup lang="ts">
import { ref } from 'vue'

import { GrCheckbox, GrFormField, GrFormSection, GrInput } from '@feugene/granularity'

const channel = ref('release-updates')
const includeStakeholders = ref(true)
const requireApproval = ref(false)
</script>

<template>
  <GrFormSection
    title="Notification routing"
    description="Section wrappers keep longer forms readable when fields are grouped by intent."
  >
    <div class="grid gap-4">
      <GrFormField label="Slack channel" for-id="notify-channel">
        <GrInput id="notify-channel" v-model="channel" placeholder="release-updates" />
      </GrFormField>

      <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
        <GrCheckbox v-model="includeStakeholders">
          Include business stakeholders in the launch message
        </GrCheckbox>
        <GrCheckbox v-model="requireApproval">
          Require manual approval before notifications are sent
        </GrCheckbox>
      </div>
    </div>
  </GrFormSection>
</template>