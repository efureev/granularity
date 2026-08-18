<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrCard, GrChip, GrChipGroup } from '@feugene/granularity'

const statuses = [
  { value: 'open', label: 'Открытые' },
  { value: 'review', label: 'На ревью' },
  { value: 'blocked', label: 'Заблокированные' },
  { value: 'done', label: 'Готовые' },
]

const selected = ref<string[]>(['open', 'review'])

const summary = computed(() => (selected.value.length
  ? statuses.filter(status => selected.value.includes(status.value)).map(s => s.label).join(', ')
  : 'любой статус'))
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <GrChipGroup v-model="selected" aria-label="Статус задачи">
      <GrChip
        v-for="status in statuses"
        :key="status.value"
        :value="status.value"
        :label="status.label"
        tone="primary"
      />
    </GrChipGroup>

    <GrCard class="p-4 text-sm text-[var(--gr-muted-fg)]">
      Показываем: <span class="font-semibold text-[var(--gr-fg)]">{{ summary }}</span>
    </GrCard>
  </div>
</template>
