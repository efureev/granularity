<script setup lang="ts">
import { ref } from 'vue'

// `GrDatePicker` подставляется авто-импортом (`unplugin-vue-components`).
const value = ref<string | null>('2026-08-12')
</script>

<template>
  <div class="grid gap-4 justify-items-start">
    <!-- Панель на месте, поля нет — но модель, адаптер и `name` остаются
         пикеровскими: этим `inline` и отличается от голого `GrCalendar`. -->
    <GrDatePicker
      v-model="value"
      inline
      name="due"
      value-adapter="isoDate"
      locale="en-US"
      aria-label="Due date"
    />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">value=</span><code>{{ value ?? '—' }}</code>
    </p>
  </div>
</template>
