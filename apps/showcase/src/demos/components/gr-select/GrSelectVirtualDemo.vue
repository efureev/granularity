<script setup lang="ts">
import { ref } from 'vue'

import { GrSelect } from '@feugene/granularity'

// Сто групп по сто позиций. Группы переживают окно: если панель прокручена
// внутрь группы, её обёртка всё равно есть и берёт имя через `aria-label`.
const groupedOptions = Array.from({ length: 100 }, (_, groupIndex) => ({
  label: `Region ${groupIndex + 1}`,
  options: Array.from({ length: 100 }, (_, index) => ({
    value: `r${groupIndex + 1}-city-${index + 1}`,
    label: `Region ${groupIndex + 1} · City ${index + 1}`,
  })),
}))

const city = ref('')
</script>

<template>
  <div class="grid gap-3">
    <GrSelect
      v-model="city"
      :options="groupedOptions"
      options-view="panel"
      virtual
      filterable
      clearable
      placeholder="Search among 10 000 cities…"
      aria-label="Search a city"
    />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Selected: <code>{{ city || '—' }}</code>
    </p>
  </div>
</template>
