<script setup lang="ts">
import { ref } from 'vue'

// `GrTimePicker` подставляется авто-импортом (`unplugin-vue-components`).
const value = ref<Date | null>(new Date(2026, 7, 12, 9, 30))

// Границы учитывают только время суток: рабочий день с 09:00 до 18:00.
const from = new Date(2026, 7, 12, 9, 0)
const to = new Date(2026, 7, 12, 18, 0)
</script>

<template>
  <div class="grid max-w-[320px] gap-4">
    <GrTimePicker
      v-model="value"
      :min="from"
      :max="to"
      :minute-step="15"
      :use12-hours="false"
      locale="en-US"
      clearable
      placeholder="Pick a time"
      aria-label="Meeting time"
    />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">value=</span>
      <code>{{ value ? value.toTimeString().slice(0, 5) : '—' }}</code>
    </p>
  </div>
</template>
