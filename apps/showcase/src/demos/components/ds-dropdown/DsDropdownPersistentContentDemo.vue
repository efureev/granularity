<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsButton, DsDropdown } from '@feugene/granularity'

const selected = ref<string[]>(['Errors'])

function toggleOption(option: string) {
  selected.value = selected.value.includes(option)
    ? selected.value.filter(item => item !== option)
    : [...selected.value, option]
}
</script>

<template>
  <div class="grid gap-3">
    <DsDropdown :close-on-content-click="false" width="64">
      <template #trigger>
        <DsButton variant="outline">Filters</DsButton>
      </template>

      <template #content="{ close }">
        <div class="grid gap-3 px-3 py-2 text-sm">
          <div class="font-semibold">Visible states</div>

          <label v-for="option in ['Errors', 'Warnings', 'Passed']" :key="option" class="flex items-center gap-2">
            <input
              :checked="selected.includes(option)"
              type="checkbox"
              @change="toggleOption(option)"
            >
            <span>{{ option }}</span>
          </label>

          <DsButton size="sm" class="justify-self-start" @click="close">
            Apply filters
          </DsButton>
        </div>
      </template>
    </DsDropdown>

    <DsBadge>
      {{ selected.join(', ') }}
    </DsBadge>
  </div>
</template>