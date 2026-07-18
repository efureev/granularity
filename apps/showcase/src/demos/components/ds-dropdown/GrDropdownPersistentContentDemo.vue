<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrButton, GrDropdown } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()

const options = computed(() => [
  { value: 'errors', label: t('components.GrDropdown.persistent.errors') },
  { value: 'warnings', label: t('components.GrDropdown.persistent.warnings') },
  { value: 'passed', label: t('components.GrDropdown.persistent.passed') },
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
    <GrDropdown :close-on-content-click="false" width="64">
      <template #trigger>
        <GrButton variant="outline">{{ t('components.GrDropdown.persistent.filters') }}</GrButton>
      </template>

      <template #content="{ close }">
        <div class="grid gap-3 px-3 py-2 text-sm">
          <div class="font-semibold">{{ t('components.GrDropdown.persistent.visibleStates') }}</div>

          <label v-for="option in options" :key="option.value" class="flex items-center gap-2">
            <input
              :checked="selected.includes(option.value)"
              type="checkbox"
              @change="toggleOption(option.value)"
            >
            <span>{{ option.label }}</span>
          </label>

          <GrButton size="sm" class="justify-self-start" @click="close">
            {{ t('components.GrDropdown.persistent.apply') }}
          </GrButton>
        </div>
      </template>
    </GrDropdown>

    <GrBadge>
      {{ selectedLabels }}
    </GrBadge>
  </div>
</template>
