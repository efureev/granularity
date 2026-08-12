<script setup lang="ts">
import { ref } from 'vue'

// `GrDateRangePicker` подставляется авто-импортом (`unplugin-vue-components`).
const value = ref<readonly [Date, Date] | null>(null)

const from = new Date(2026, 7, 1)
</script>

<template>
  <div class="grid max-w-[360px] gap-4">
    <!-- Длина считает обе границы: от трёх до семи дней включительно.
         Недопустимая длина не выбирается, но и не сбрасывает начало. -->
    <GrDateRangePicker
      v-model="value"
      :min="from"
      :min-range="3"
      :max-range="7"
      locale="en-US"
      clearable
      placeholder="From 3 to 7 days"
      aria-label="Vacation"
    />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">days=</span>
      <code>{{ value ? Math.round((value[1].getTime() - value[0].getTime()) / 86400000) + 1 : '—' }}</code>
    </p>
  </div>
</template>
