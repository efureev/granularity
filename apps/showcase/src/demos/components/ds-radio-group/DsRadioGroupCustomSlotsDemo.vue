<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsRadio, DsRadioGroup } from '@feugene/granularity'

const channel = ref('slack')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <DsRadioGroup v-model="channel" name="incident-channel">
      <DsRadio value="slack">
        <span class="inline-flex items-center gap-2">
          Slack
          <DsBadge tone="success" size="sm">Primary</DsBadge>
        </span>
      </DsRadio>
      <DsRadio value="email">
        <span class="inline-flex items-center gap-2">
          Email
          <DsBadge tone="warning" size="sm">Fallback</DsBadge>
        </span>
      </DsRadio>
      <DsRadio value="pagerduty">
        <span class="inline-flex items-center gap-2">
          PagerDuty
          <DsBadge tone="danger" size="sm">Escalation</DsBadge>
        </span>
      </DsRadio>
    </DsRadioGroup>

    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 text-sm text-[var(--muted-fg)]">
      Routed through: <span class="font-semibold text-[var(--fg)]">{{ channel }}</span>
    </div>
  </div>
</template>