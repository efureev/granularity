<script setup lang="ts">
import { ref } from 'vue'

// `GrCalendar` и `GrSegmented` подставляются авто-импортом.
import type { PlainDate } from '@feugene/granularity-chrono'
import { formatPlainDate } from '@feugene/granularity-chrono'

type CalendarMode = 'day' | 'month' | 'year'

const mode = ref<CalendarMode>('day')
const value = ref<PlainDate | null>({ y: 2026, m: 7, d: 12 })

const modeOptions = [
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
] satisfies Array<{ value: CalendarMode, label: string }>

// В режимах периода значением становится первое число: месяц — это 1 августа,
// год — 1 января.
const formatByMode: Record<CalendarMode, Intl.DateTimeFormatOptions> = {
  day: { dateStyle: 'medium' },
  month: { month: 'long', year: 'numeric' },
  year: { year: 'numeric' },
}
</script>

<template>
  <div class="grid gap-4 justify-items-start">
    <GrSegmented v-model="mode" :options="modeOptions" size="sm" />

    <GrCalendar
      v-model="value"
      :mode="mode"
      locale="en-US"
      aria-label="Reporting period"
    />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">value=</span>
      <code>{{ value ? formatPlainDate('en-US', value, formatByMode[mode]) : '—' }}</code>
    </p>
  </div>
</template>
