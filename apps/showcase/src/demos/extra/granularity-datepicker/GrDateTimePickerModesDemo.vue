<script setup lang="ts">
import { ref } from 'vue'

import { GrRadioGroup } from '@feugene/granularity'
import { GrDateTimePicker } from '@feugene/granularity-datepicker'
import type { GrDateTimeModel, GrDateTimePickerMode } from '@feugene/granularity-datepicker'

const mode = ref<GrDateTimePickerMode>('datetime')
const value = ref<GrDateTimeModel>(null)

const modeOptions = [
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date + time' },
  { value: 'time', label: 'Time' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
] satisfies Array<{ value: GrDateTimePickerMode, label: string }>
</script>

<template>
  <div class="grid gap-4">
    <GrRadioGroup v-model="mode" :options="modeOptions" variant="button" size="sm" />

    <div class="max-w-[320px]">
      <GrDateTimePicker
        v-model="value"
        :mode="mode"
        locale="en"
        placeholder="Pick a value"
        aria-label="Pick a value"
      />
    </div>

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">mode=</span><code>{{ mode }}</code>
      <span class="opacity-70"> · value=</span><code>{{ value ?? '—' }}</code>
    </p>
  </div>
</template>
