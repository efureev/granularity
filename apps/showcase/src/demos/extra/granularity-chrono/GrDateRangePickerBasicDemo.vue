<script setup lang="ts">
import { ref } from 'vue'

// `GrDateRangePicker` подставляется авто-импортом (`unplugin-vue-components`).
const value = ref<readonly [string, string] | null>(['2026-08-10', '2026-08-14'])
</script>

<template>
  <div class="grid max-w-[360px] gap-4">
    <!-- Период набирается двумя кликами; пока он открыт, сетка показывает
         предпросмотр до дня под курсором. -->
    <GrDateRangePicker
      v-model="value"
      value-adapter="isoDate"
      locale="en-US"
      clearable
      placeholder="Pick a period"
      aria-label="Stay"
    />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">value=</span><code>{{ value ? value.join(' … ') : '—' }}</code>
    </p>
  </div>
</template>
