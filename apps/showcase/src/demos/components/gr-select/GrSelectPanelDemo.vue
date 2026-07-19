<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrSelect } from '@feugene/granularity'

const options = [
  { value: 'design', label: 'Design' },
  { value: 'platform', label: 'Platform' },
  { value: 'billing', label: 'Billing' },
  { value: 'support', label: 'Support' },
]

const selectedTeams = ref<string[]>(['design', 'platform'])
</script>

<template>
  <div class="grid gap-3">
    <GrSelect
      v-model="selectedTeams"
      multiple
      optionsView="panel"
      :close-on-select="false"
      :options="options"
      placeholder="Pick teams"
      aria-label="Pick teams"
    />

    <div class="flex flex-wrap gap-2">
      <GrBadge v-for="team in selectedTeams" :key="team">
        {{ team }}
      </GrBadge>
      <span v-if="selectedTeams.length === 0" class="text-sm text-[var(--muted-fg)]">
        Nothing selected yet
      </span>
    </div>
  </div>
</template>