<script setup lang="ts">
import { ref } from 'vue'

// `GrTimePicker` подставляется авто-импортом (`unplugin-vue-components`).
import type { GrDateTimeModel } from '@feugene/granularity-datepicker'

const value = ref<GrDateTimeModel>(null)
</script>

<template>
  <div class="grid max-w-[320px] gap-3">
    <GrTimePicker
      v-model="value"
      enable-seconds
      placeholder="Pick a time"
      aria-label="Pick a time"
    />
    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">value=</span><code>{{ value ?? '—' }}</code>
    </p>
  </div>
</template>
