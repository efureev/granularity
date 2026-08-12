<script setup lang="ts">
// `GrRelativeTime` подставляется авто-импортом (`unplugin-vue-components`).

/**
 * Момент отсчёта задан пропом `base` — от него и считается вся шкала. Так
 * пример показывает одно и то же в любой день и не зависит от часов машины,
 * на которой открыт.
 */
const now = new Date(2026, 7, 12, 12, 0)

function ago(ms: number): Date {
  return new Date(now.getTime() - ms)
}

const scale = [
  { label: 'секунды', value: ago(3 * 1000) },
  { label: 'минуты', value: ago(3 * 60_000) },
  { label: 'часы', value: ago(4 * 3_600_000) },
  { label: 'вчера', value: new Date(2026, 7, 11, 12, 0) },
  { label: 'недели', value: new Date(2026, 6, 29, 12, 0) },
  { label: 'месяцы', value: new Date(2026, 4, 12, 12, 0) },
  { label: 'годы', value: new Date(2024, 7, 12, 12, 0) },
  { label: 'будущее', value: new Date(2026, 7, 14, 12, 0) },
]
</script>

<template>
  <div class="grid gap-2">
    <div v-for="row in scale" :key="row.label" class="flex items-baseline gap-3 text-sm">
      <span class="showcase-demo-text w-24 shrink-0 opacity-70">{{ row.label }}</span>

      <GrRelativeTime :value="row.value" :base="now" locale="en-US" />

      <GrRelativeTime :value="row.value" :base="now" locale="en-US" width="short" class="opacity-70" />
    </div>
  </div>
</template>
