<script setup lang="ts">
// `GrRelativeTime` подставляется авто-импортом (`unplugin-vue-components`).

const now = new Date(2026, 7, 12, 12, 0)

const posts = [
  new Date(2026, 7, 12, 9, 30),
  new Date(2026, 7, 5, 12, 0),
  new Date(2026, 6, 2, 12, 0),
  new Date(2025, 10, 20, 12, 0),
]

/** Вид абсолютной даты — опциями `Intl`, а не строкой-паттерном. */
const format: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
</script>

<template>
  <div class="grid gap-2">
    <p class="showcase-demo-text text-sm opacity-70">
      Старше 30 дней — обычная дата: «347 дней назад» не помогает никому.
    </p>

    <div v-for="post in posts" :key="post.toISOString()" class="text-sm">
      <GrRelativeTime :value="post" :base="now" :cutoff="30" :format="format" />
    </div>
  </div>
</template>
