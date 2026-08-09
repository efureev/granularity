<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrButton, GrDropdown } from '@feugene/granularity'

const options = computed(() => [
  { value: 'errors', label: 'Errors' },
  { value: 'warnings', label: 'Warnings' },
  { value: 'passed', label: 'Passed' },
])

const selected = ref<string[]>(['errors'])

const selectedLabels = computed(() =>
  options.value
    .filter(option => selected.value.includes(option.value))
    .map(option => option.label)
    .join(', '),
)

function toggleOption(option: string) {
  selected.value = selected.value.includes(option)
    ? selected.value.filter(item => item !== option)
    : [...selected.value, option]
}
</script>

<template>
  <div class="grid gap-3">
    <GrDropdown :close-on-content-click="false" width="16rem">
      <template #trigger="{ triggerProps }">
        <GrButton variant="outline" v-bind="triggerProps">Filters</GrButton>
      </template>

      <template #content="{ close }">
        <div class="grid gap-3 px-3 py-2 text-sm">
          <div class="font-semibold">Visible states</div>

          <label v-for="option in options" :key="option.value" class="flex items-center gap-2">
            <input
              :checked="selected.includes(option.value)"
              type="checkbox"
              @change="toggleOption(option.value)"
            >
            <span>{{ option.label }}</span>
          </label>

          <GrButton size="sm" class="justify-self-start" @click="close">
            Apply filters
          </GrButton>
        </div>
      </template>
    </GrDropdown>

    <GrBadge>
      {{ selectedLabels }}
    </GrBadge>
  </div>
</template>
