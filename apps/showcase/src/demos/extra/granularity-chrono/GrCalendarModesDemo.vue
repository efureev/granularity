<script setup lang="ts">
import { ref } from 'vue'

// `GrCalendar` и `GrSegmented` подставляются авто-импортом.
import type { PlainDate } from '@feugene/granularity-chrono'
import { plainDateKey } from '@feugene/granularity-chrono'

type CalendarMode = 'day' | 'month' | 'year'

const mode = ref<CalendarMode>('day')
// В режимах периода значением становится первое число: месяц — это 1 августа,
// год — 1 января. Показываем его ISO-ключом: он не зависит от языка витрины,
// а сетка рядом и так показывает язык.
const value = ref<PlainDate | null>({ y: 2026, m: 7, d: 12 })

const modeOptions = [
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
] satisfies Array<{ value: CalendarMode, label: string }>
</script>

<template>
  <div class="grid gap-4 justify-items-start">
    <GrSegmented v-model="mode" :options="modeOptions" size="sm" />

    <GrCalendar
      v-model="value"
      :mode="mode"
      aria-label="Reporting period"
    />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">value=</span>
      <code>{{ value ? plainDateKey(value) : '—' }}</code>
    </p>
  </div>
</template>
