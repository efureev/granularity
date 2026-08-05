<script setup lang="ts">
import { ref } from 'vue'

import { GrCheckboxGroup, GrSegmented } from '@feugene/granularity'

const options = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
  { value: 'webhook', label: 'Webhook', disabled: true },
]

const channels = ref(['email', 'push'])
const direction = ref<'vertical' | 'horizontal'>('vertical')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
    <div class="grid gap-3 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <GrCheckboxGroup
        v-model="channels"
        name="channels"
        :options="options"
        :direction="direction"
        aria-label="Notification channels"
      />
    </div>

    <div class="grid gap-3 rounded-2xl border border-dashed border-[var(--gr-brd)] p-4">
      <GrSegmented
        v-model="direction"
        size="sm"
        :options="[
          { value: 'vertical', label: 'Vertical' },
          { value: 'horizontal', label: 'Horizontal' },
        ]"
      />

      <div class="text-sm text-[var(--gr-muted-fg)]">
        Selected: <span class="font-semibold text-[var(--gr-fg)]">{{ channels.join(', ') || 'none' }}</span>
      </div>
    </div>
  </div>
</template>
