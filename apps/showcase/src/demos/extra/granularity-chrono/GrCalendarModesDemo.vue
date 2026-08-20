<script setup lang="ts">
import { ref } from 'vue'

// `GrCalendar` и `GrSegmented` подставляются авто-импортом.
import type { PlainDate } from '@feugene/granularity-chrono'
import { plainDateKey } from '@feugene/granularity-chrono'

type CalendarMode = 'day' | 'week' | 'month' | 'quarter' | 'year'

const mode = ref<CalendarMode>('day')
// В режимах периода значением становится первое число: месяц — это 1 августа,
// квартал — 1 июля, год — 1 января. Неделя кладёт своё начало, и оно зависит
// от локали: у `en-US` неделя начинается с воскресенья. Показываем значение
// ISO-ключом — он не зависит от языка витрины, а сетка рядом и так показывает язык.
const value = ref<PlainDate | null>({ y: 2026, m: 7, d: 12 })

const modeOptions = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
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

    <p class="showcase-demo-text text-sm opacity-70">
      Неделя рисуется той же сеткой дней: клик по любому дню выбирает его неделю, и подсвечивается
      вся строка. Двенадцать недель в сетке периодов были бы четвертью года без единой подписи
      месяца — выбирать там нечего. Кварталов четыре, и сетка у них в две колонки.
    </p>
  </div>
</template>
