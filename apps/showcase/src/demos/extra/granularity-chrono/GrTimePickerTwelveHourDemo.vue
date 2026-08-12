<script setup lang="ts">
import { ref } from 'vue'

// `GrTimePicker` подставляется авто-импортом (`unplugin-vue-components`).
const value = ref<string | null>('2026-08-12T15:30:45')
</script>

<template>
  <div class="grid max-w-[320px] gap-4">
    <!-- 12/24 приходит из локали, но проп перебивает её; секунды добавляют
         третью колонку и попадают в показ. -->
    <GrTimePicker
      v-model="value"
      value-adapter="isoDateTime"
      use12-hours
      enable-seconds
      :second-step="15"
      locale="en-US"
      clearable
      aria-label="Start time"
    />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">value=</span><code>{{ value ?? '—' }}</code>
    </p>
  </div>
</template>
