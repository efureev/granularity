<script setup lang="ts">
import { ref } from 'vue'

/**
 * Шорткаты живут внутри панели, а не рядом с полем: период обязан выставить
 * обе границы разом и уважать `maxRange`. Здесь потолок — 31 день, и «Последние
 * 90 дней» приходит выключенным, а не молча ничего не делает.
 */
const period = ref<[Date, Date] | null>(null)

/** Границы функцией: «последние 7 дней» отсчитываются от сегодняшнего дня. */
function lastDays(count: number): () => [Date, Date] {
  return () => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - count + 1)

    return [from, to]
  }
}

function thisMonth(): [Date, Date] {
  const now = new Date()

  return [new Date(now.getFullYear(), now.getMonth(), 1), now]
}

const presets = [
  { label: 'Сегодня', range: lastDays(1) },
  { label: 'Последние 7 дней', range: lastDays(7) },
  { label: 'Этот месяц', range: thisMonth },
  { label: 'Последние 90 дней', range: lastDays(90) },
]
</script>

<template>
  <div class="grid gap-3 justify-items-start">
    <GrDateRangePicker
      v-model="period"
      :presets="presets"
      :max-range="31"
      placeholder="Период отчёта"
    />

    <p class="showcase-demo-text text-sm opacity-70">
      Период длиннее месяца запрещён, поэтому «Последние 90 дней» выключены —
      кнопка, которая ничего не делает, обманывает. Свой подвал ставится слотом
      <code>footer</code>: он получает <code>setRange</code> и те же правила.
    </p>
  </div>
</template>
