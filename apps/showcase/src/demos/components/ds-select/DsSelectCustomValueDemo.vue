<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsSelect } from '@feugene/granularity'

const options = [
  { value: 'ru', label: 'Russia' },
  { value: 'kz', label: 'Kazakhstan' },
  { value: 'uz', label: 'Uzbekistan' },
]

const region = ref('')
</script>

<template>
  <div class="grid gap-3">
    <DsSelect
      v-model="region"
      optionsView="panel"
      allow-custom-value
      :options="options"
      placeholder="Pick or add region"
      aria-label="Pick or add region"
    >
      <template #value="{ displayLabel, hasSelection, placeholder }">
        <span v-if="hasSelection" class="inline-flex items-center gap-2 min-w-0">
          <DsBadge>custom</DsBadge>
          <span class="truncate">{{ displayLabel }}</span>
        </span>
        <span v-else class="text-[var(--muted-fg)]">{{ placeholder }}</span>
      </template>
    </DsSelect>

    <div class="text-sm text-[var(--muted-fg)]">
      current value: {{ region || '—' }}
    </div>
  </div>
</template>