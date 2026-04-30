<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrRadio, GrRadioGroup } from '@feugene/granularity'

const channel = ref('slack')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <GrRadioGroup v-model="channel" name="incident-channel">
      <GrRadio value="slack">
        <span class="inline-flex items-center gap-2">
          Slack
          <GrBadge tone="success" size="sm">Primary</GrBadge>
        </span>
      </GrRadio>
      <GrRadio value="email">
        <span class="inline-flex items-center gap-2">
          Email
          <GrBadge tone="warning" size="sm">Fallback</GrBadge>
        </span>
      </GrRadio>
      <GrRadio value="pagerduty">
        <span class="inline-flex items-center gap-2">
          PagerDuty
          <GrBadge tone="danger" size="sm">Escalation</GrBadge>
        </span>
      </GrRadio>
    </GrRadioGroup>

    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 text-sm text-[var(--muted-fg)]">
      Routed through: <span class="font-semibold text-[var(--fg)]">{{ channel }}</span>
    </div>
  </div>
</template>