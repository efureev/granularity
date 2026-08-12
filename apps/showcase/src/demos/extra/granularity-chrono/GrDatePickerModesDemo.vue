<script setup lang="ts">
import { ref } from 'vue'

// `GrDatePicker` подставляется авто-импортом (`unplugin-vue-components`).
const day = ref<string | null>('2026-08-12')
const month = ref<string | null>('2026-08-01')
const year = ref<string | null>('2026-01-01')
</script>

<template>
  <div class="grid max-w-[320px] gap-4">
    <!-- Режим меняет и панель, и вид значения в поле: подставлять свой
         `format` для этого не нужно. -->
    <GrDatePicker v-model="day" value-adapter="isoDate" locale="en-US" aria-label="Day" />
    <GrDatePicker v-model="month" mode="month" value-adapter="isoDate" locale="en-US" aria-label="Month" />
    <GrDatePicker v-model="year" mode="year" value-adapter="isoDate" locale="en-US" aria-label="Year" />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">day=</span><code>{{ day ?? '—' }}</code>
      <span class="opacity-70"> · month=</span><code>{{ month ?? '—' }}</code>
      <span class="opacity-70"> · year=</span><code>{{ year ?? '—' }}</code>
    </p>
  </div>
</template>
