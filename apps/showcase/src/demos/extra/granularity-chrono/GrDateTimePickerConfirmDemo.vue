<script setup lang="ts">
import { ref } from 'vue'

// `GrDateTimePicker` подставляется авто-импортом (`unplugin-vue-components`).
const value = ref<string | null>('2026-08-12T09:00:00')
const changes = ref(0)
</script>

<template>
  <div class="grid max-w-[360px] gap-4">
    <!-- `auto-apply="false"`: панель правит черновик, а модель меняется
         кнопкой. Счётчик показывает, что до подтверждения её никто не трогал. -->
    <GrDateTimePicker
      v-model="value"
      :auto-apply="false"
      value-adapter="isoDateTime"
      :minute-step="30"
      aria-label="Appointment"
      @change="changes += 1"
    />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">value=</span><code>{{ value ?? '—' }}</code>
      <span class="opacity-70"> · changes=</span><code>{{ changes }}</code>
    </p>
  </div>
</template>
