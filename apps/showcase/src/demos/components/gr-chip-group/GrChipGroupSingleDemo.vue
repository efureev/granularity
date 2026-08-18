<script setup lang="ts">
import { ref } from 'vue'

import { GrCard, GrChip, GrChipGroup } from '@feugene/granularity'

const periods = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
]

// Повторное нажатие на выбранный чип сбрасывает период в «любой».
const period = ref<string | null>('week')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <GrChipGroup v-model="period" selection="single" tone="info" aria-label="Период отчёта">
      <GrChip
        v-for="item in periods"
        :key="item.value"
        :value="item.value"
        :label="item.label"
      />
    </GrChipGroup>

    <GrCard class="p-4 text-sm text-[var(--gr-muted-fg)]">
      Период: <span class="font-semibold text-[var(--gr-fg)]">{{ period ?? 'весь' }}</span>
    </GrCard>
  </div>
</template>
