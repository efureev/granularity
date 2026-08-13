<script setup lang="ts">
// `GrChartRadar` подставляется авто-импортом (`unplugin-vue-components`).

/**
 * Радар отвечает на вопрос, которого не закрывают ни столбцы, ни круг: не
 * «сколько» и не «из чего», а **какой формы**. Два профиля на одной паутине
 * сравниваются одним взглядом — там, где две таблицы пришлось бы читать.
 */
const axes = ['Скорость', 'Цена', 'Поддержка', 'Надёжность', 'Документация']

const series = [
  { id: 'ours', label: 'Наш продукт', x: axes, y: [8, 6, 9, 8, 7] },
  { id: 'rival', label: 'Конкурент', x: axes, y: [6, 9, 5, 7, 4] },
]
</script>

<template>
  <div class="grid gap-3">
    <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Оценка по десятибалльной шкале
    </span>

    <GrChartRadar
      :series="series"
      :height="300"
      show-legend
      aria-label="Сравнение продуктов по пяти критериям"
    />
  </div>
</template>
