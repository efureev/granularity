<script setup lang="ts">
import { ref } from 'vue'

/**
 * Горизонталь берут, когда подписи шагов длиннее, чем позволяет ширина
 * категории: под вертикальной осью они налезли бы друг на друга.
 *
 * Оси в этом режиме рисует сам компонент — ось значений рамы вертикальна по
 * построению, а здесь она внизу.
 */
const steps = [
  { label: 'Обязательство на начало', value: 84_200, kind: 'total' as const },
  { label: 'Начислено по подпискам', value: 31_400 },
  { label: 'Куплено пакетами', value: 12_800 },
  { label: 'Списано', value: -28_900 },
  { label: 'Сгорело', value: -6100 },
]

const orientation = ref<'vertical' | 'horizontal'>('horizontal')
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Экономика кредитов
      </span>

      <GrSegmented
        v-model="orientation"
        size="sm"
        :options="[
          { value: 'horizontal', label: 'Горизонтально' },
          { value: 'vertical', label: 'Вертикально' },
        ]"
        aria-label="Раскладка моста"
      />
    </div>

    <GrChartWaterfall
      :steps="steps"
      :orientation="orientation"
      :height="300"
      show-total
      aria-label="Экономика кредитов за период"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      <code>showTotal</code> дорисовывает итоговый столбец от нуля. Накопления он не меняет — только
      показывает: соединитель к нему не ведёт, потому что он не продолжает мост, а объявляет его результат.
    </p>
  </div>
</template>
