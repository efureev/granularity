<script setup lang="ts">
import { ref } from 'vue'

/**
 * Ступень, которая больше предыдущей, воронка не выпрямляет: это либо ошибка
 * данных, либо разные когорты, и решать должен читатель, а не компонент.
 *
 * Факт роста попадает в описание графика — иначе он существовал бы только для
 * зрячих.
 */
const stages = [
  { label: 'Открыли форму', value: 1200 },
  { label: 'Начали заполнять', value: 860 },
  { label: 'Отправили', value: 940 },
  { label: 'Прошли модерацию', value: 610 },
]

const shape = ref<'trapezoid' | 'bar'>('trapezoid')
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Заявки: форма и модерация
      </span>

      <GrSegmented
        v-model="shape"
        size="sm"
        :options="[
          { value: 'trapezoid', label: 'Лента' },
          { value: 'bar', label: 'Полосы' },
        ]"
        aria-label="Форма ступеней"
      />
    </div>

    <GrChartFunnel
      :stages="stages"
      :shape="shape"
      labels="value"
      :height="280"
      data-table="visible"
      aria-label="Воронка заявок"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      «Отправили» шире, чем «начали заполнять»: часть заявок пришла из сохранённых черновиков.
      Ширина ступени пропорциональна <strong>значению</strong>, а не порядку, поэтому рост виден —
      и назван в описании графика словами. Лента и полосы дают одни и те же числа в таблице.
    </p>
  </div>
</template>
