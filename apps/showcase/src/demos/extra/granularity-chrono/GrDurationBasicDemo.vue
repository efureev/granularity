<script setup lang="ts">
import { ref } from 'vue'

/**
 * Три формы значения — три разных вопроса. Число это готовая длина, пара дат —
 * промежуток между моментами, одна дата — время, которое идёт прямо сейчас.
 */
const started = ref(new Date())

const rows = [
  { title: 'Длительность звонка', value: 9000 },
  { title: 'Сборка заняла', value: 10_770 },
]

const meeting: [Date, Date] = [
  new Date(2026, 7, 12, 9, 0),
  new Date(2026, 7, 12, 11, 30),
]
</script>

<template>
  <div class="grid gap-3">
    <div v-for="row in rows" :key="row.title" class="flex items-baseline justify-between gap-6 text-sm">
      <span class="opacity-70">{{ row.title }}</span>
      <GrDuration :value="row.value" />
    </div>

    <div class="flex items-baseline justify-between gap-6 text-sm">
      <span class="opacity-70">Совещание</span>
      <GrDuration :value="meeting" />
    </div>

    <div class="flex items-baseline justify-between gap-6 text-sm">
      <span class="opacity-70">Страница открыта</span>
      <GrDuration :value="started" />
    </div>

    <p class="showcase-demo-text text-sm opacity-70">
      «Сборка заняла» показывает <strong>2 ч 59 мин</strong>, а не «3 ч»: младшее
      отбрасывается, а не округляется. Последняя строка тикает сама — такт
      выбирается по младшей показанной единице, и таймер в приложении один на всех.
    </p>
  </div>
</template>
