<script setup lang="ts">
import { ref } from 'vue'

import { GrAutocomplete } from '@feugene/granularity'

const options = [
  { value: 'design', label: 'Design' },
  { value: 'platform', label: 'Platform' },
  { value: 'billing', label: 'Billing' },
  { value: 'support', label: 'Support' },
  { value: 'growth', label: 'Growth' },
  { value: 'security', label: 'Security' },
]

const teams = ref<string[]>(['design', 'platform'])
</script>

<template>
  <div class="grid gap-3">
    <GrAutocomplete
      v-model="teams"
      multiple
      :options="options"
      allow-custom-value
      :close-on-select="false"
      clearable
      placeholder="Add teams…"
      aria-label="Add teams"
    />

    <p class="text-sm text-[var(--muted-fg)]">
      Backspace on an empty query removes the last tag. Type a new value and press Enter to add a custom team.
    </p>
  </div>
</template>
