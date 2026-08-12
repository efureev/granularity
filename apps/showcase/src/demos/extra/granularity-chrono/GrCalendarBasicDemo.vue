<script setup lang="ts">
import { ref } from 'vue'

// `GrCalendar` подставляется авто-импортом (`unplugin-vue-components`).
import type { PlainDate } from '@feugene/granularity-chrono'
import { formatPlainDate } from '@feugene/granularity-chrono'

// Дата — кортеж `{ y, m, d }`, где `m` считается с нуля. Ни `Date`, ни
// таймзоны здесь нет: сетка про календарь, а не про момент времени.
const value = ref<PlainDate | null>({ y: 2026, m: 7, d: 12 })

const min: PlainDate = { y: 2026, m: 7, d: 3 }
const max: PlainDate = { y: 2026, m: 8, d: 18 }
</script>

<template>
  <div class="grid gap-4 justify-items-start">
    <GrCalendar
      v-model="value"
      :min="min"
      :max="max"
      show-week-numbers
      locale="en-US"
      aria-label="Delivery date"
    />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">value=</span>
      <code>{{ value ? formatPlainDate('en-US', value) : '—' }}</code>
    </p>
  </div>
</template>
