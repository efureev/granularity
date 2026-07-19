<script setup lang="ts">
import { ref } from 'vue'

import { GrDatePicker } from '@feugene/granularity-datepicker'
import type { GrDateTimeModel } from '@feugene/granularity-datepicker'

const value = ref<GrDateTimeModel>(null)
</script>

<template>
  <div class="grid max-w-[320px] gap-3">
    <GrDatePicker
      v-model="value"
      locale="en"
      clearable
      placeholder="Pick a date"
      aria-label="Pick a date"
    />
    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">value=</span><code>{{ value ?? '—' }}</code>
    </p>
  </div>
</template>
