<script setup lang="ts">
import { ref } from 'vue'

/**
 * Расходящаяся шкала берут, когда важно отклонение в обе стороны: недобор и
 * перебор красятся разными ролями вокруг середины.
 *
 * Ступени против непрерывной шкалы — вопрос того, читают график как карту зон
 * или как градиент.
 */
const xLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const yLabels = ['Утро', 'День', 'Вечер', 'Ночь']

const values = [
  [12, 8, -4, 6, 14, -22, -31],
  [24, 19, 16, 22, 28, -8, -18],
  [6, 11, 9, 14, 32, 21, 4],
  [-14, -12, -16, -11, -2, 9, -6],
]

const steps = ref(5)
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Отклонение нагрузки от нормы, %
      </span>

      <GrSegmented
        v-model="steps"
        size="sm"
        :options="[
          { value: 5, label: '5 ступеней' },
          { value: 0, label: 'Непрерывно' },
        ]"
        aria-label="Шкала цвета"
      />
    </div>

    <GrChartHeatmap
      :values="values"
      :x-labels="xLabels"
      :y-labels="yLabels"
      scale="diverging"
      :midpoint="0"
      :steps="steps"
      :height="220"
      show-values
      aria-label="Отклонение нагрузки от нормы"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Расходящаяся шкала нормируется на <strong>больший</strong> из отступов от середины — так она
      симметрична по построению, а не по совпадению данных. Контраст подписи в ячейке считается от
      доли примеси: измерить итоговый цвет без DOM нечем.
    </p>
  </div>
</template>
