<script setup lang="ts">
import { ref } from 'vue'

// `GrDateTimePicker` подставляется авто-импортом (`unplugin-vue-components`).
const value = ref<string | null>('2026-08-12T14:30:00')
</script>

<template>
  <div class="grid max-w-[360px] gap-4">
    <!-- Сетка и колонки в одной панели: смена дня сохраняет время, смена
         времени сохраняет день. -->
    <GrDateTimePicker
      v-model="value"
      value-adapter="isoDateTime"
      :minute-step="15"
      locale="en-US"
      clearable
      placeholder="Pick date and time"
      aria-label="Meeting start"
    />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">value=</span><code>{{ value ?? '—' }}</code>
    </p>
  </div>
</template>
