<script setup lang="ts">
import { ref } from 'vue'

// `GrDatePicker` подставляется авто-импортом (`unplugin-vue-components`).
const value = ref<Date | null>(new Date(2026, 7, 12))
const iso = ref<string | null>('2026-08-20')
</script>

<template>
  <div class="grid max-w-[320px] gap-4">
    <GrDatePicker
      v-model="value"
      clearable
      placeholder="Pick a date"
      aria-label="Pick a date"
    />

    <!-- Тип модели задаёт адаптер, а не строковый проп формата: значение
         остаётся `string` и в типах, и в рантайме. -->
    <GrDatePicker
      v-model="iso"
      value-adapter="isoDate"
      :format="{ dateStyle: 'full' }"
      clearable
      placeholder="ISO model"
      aria-label="ISO model"
    />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">Date=</span><code>{{ value?.toDateString() ?? '—' }}</code>
      <span class="opacity-70"> · isoDate=</span><code>{{ iso ?? '—' }}</code>
    </p>
  </div>
</template>
