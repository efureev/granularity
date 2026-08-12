<script setup lang="ts">
import { ref } from 'vue'

// `GrDatePicker` подставляется авто-импортом (`unplugin-vue-components`).
const value = ref<string | null>('2026-08-12')
const russian = ref<string | null>('2026-08-12')
</script>

<template>
  <div class="grid max-w-[320px] gap-4">
    <!-- Порядок частей и разделитель берутся из локали, поэтому маска и
         подсказка формата у полей разные, а проп — один. -->
    <GrDatePicker
      v-model="value"
      editable
      value-adapter="isoDate"
      locale="en-US"
      clearable
      aria-label="US format"
    />

    <GrDatePicker
      v-model="russian"
      editable
      value-adapter="isoDate"
      locale="ru-RU"
      clearable
      aria-label="RU format"
    />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">en=</span><code>{{ value ?? '—' }}</code>
      <span class="opacity-70"> · ru=</span><code>{{ russian ?? '—' }}</code>
    </p>
  </div>
</template>
