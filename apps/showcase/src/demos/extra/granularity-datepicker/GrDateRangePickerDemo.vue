<script setup lang="ts">
import { ref } from 'vue'

// `GrDateRangePicker` подставляется авто-импортом (`unplugin-vue-components`).
import type { GrDateRangeValue } from '@feugene/granularity-datepicker'

const value = ref<GrDateRangeValue>(null)
</script>

<template>
  <div class="grid max-w-[360px] gap-3">
    <GrDateRangePicker
      v-model="value"
      locale="en"
      placeholder="Pick a date range"
      aria-label="Pick a date range"
    />
    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">value=</span><code>{{ value?.length ? value.join(' – ') : '—' }}</code>
    </p>
  </div>
</template>
